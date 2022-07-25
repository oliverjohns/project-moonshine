import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { t } from "../trpc";
import { protectedProcedure } from "../utils/protected-procedure";
import { pusherServerClient } from "../../common/pusher";
import { ChatMessage, ChatParticipant } from "@prisma/client";

const conversationInclude = {
  participants: { include: { user: true } },
  messages: true,
};

export const chatRouter = t.router({
  sendMessage: protectedProcedure
    .input(
      z.object({
        content: z.string(),
        conversationId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
      const conversation = await ctx.prisma.chatConversation.findUniqueOrThrow({
        where: {
          id: input.conversationId,
        },
        include: { participants: { include: { user: true } } },
      });
      const message: ChatMessage = await ctx.prisma.chatMessage.create({
        data: {
          conversation: { connect: { id: conversation.id } },
          content: input.content,
          author: { connect: { id: userId } },
        },
      });
      pusherServerClient.trigger(conversation.id, "chat-message", {
        message,
        authorId: userId,
      });
      await Promise.all(
        conversation.participants.map((participant) => {
          pusherServerClient.trigger(
            `user-${participant.userId}`,
            `chat-message`,
            {
              message,
              authorId: userId,
            }
          );
        })
      );

      return {
        message,
      };
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user?.id;
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
    const conversations = (
      await ctx.prisma?.chatConversation.findMany({
        where: {
          participants: { some: { user: { id: userId } } },
        },
        include: { participants: { include: { user: true } } },
      })
    ).map((conversation) => ({
      ...conversation,
      participants: conversation.participants.filter(
        (participant) => participant.userId !== ctx.session.user.id
      ),
    }));
    const conversationsWithLastMessage = [];
    for (const conversation of conversations) {
      const lastMessage = (
        await ctx.prisma.chatMessage.findMany({
          where: {
            conversationId: conversation.id,
          },
          select: {
            createdAt: true,
            content: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        })
      )[0];
      conversationsWithLastMessage.push({ ...conversation, lastMessage });
    }
    return {
      conversations: conversationsWithLastMessage,
    };
  }),

  getFull: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
      const conversation = await ctx.prisma.chatConversation.findFirst({
        where: {
          id: input.conversationId,
          participants: { some: { user: { id: userId } } },
        },
        include: conversationInclude,
      });
      if (!conversation) throw new TRPCError({ code: "NOT_FOUND" });
      const formattedConversation = {
        ...conversation,
        participants: conversation.participants.filter(
          (participant) => participant.userId !== ctx.session.user.id
        ),
      };
      return {
        conversation: formattedConversation,
      };
    }),
  createConversation: protectedProcedure
    .input(
      z.object({
        participantIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
      const allParticipantids = [...input.participantIds, userId];
      const users = await ctx.prisma.user.findMany({
        select: { id: true },
        where: {
          id: { in: allParticipantids },
        },
      });
      const conversations = await ctx.prisma.chatConversation.findMany({
        where: {
          participants: {
            every: {
              user: { id: { in: allParticipantids } },
            },
          },
        },
        include: conversationInclude,
      });
      const existing = conversations.find(
        (conv) => conv.participants.length === allParticipantids.length
      );
      if (existing) return { conversation: existing };
      const conversation = await ctx.prisma.chatConversation.create({
        data: {},
      });
      const participants: ChatParticipant[] = [];
      for (const id of allParticipantids) {
        const participant = await ctx.prisma.chatParticipant.create({
          data: {
            conversation: { connect: { id: conversation.id } },
            user: { connect: { id: id } },
          },
          include: { user: true },
        });
        participants.push(participant);
      }
      return {
        conversation: { ...conversation, participants },
      };
    }),
});
