import { z } from "zod";
import { createProtectedRouter } from "./createRouter";
import { TRPCError } from "@trpc/server";
import { ChatMessage, ChatParticipant } from "@prisma/client";
import EventEmitter from "events";
import * as trpc from "@trpc/server";
import { pusherServerClient } from "../common/pusher";

const conversationInclude = {
  participants: { include: { user: true } },
  messages: true,
};

const ee = new EventEmitter();

export const chatRouter = createProtectedRouter()
  .mutation("sendMessage", {
    input: z.object({
      content: z.string(),
      conversationId: z.string(),
    }),
    async resolve({ input, ctx }) {
      const userEmail = ctx.session.user?.email;
      if (!userEmail) throw new TRPCError({ code: "UNAUTHORIZED" });
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
          author: { connect: { email: userEmail } },
        },
      });
      pusherServerClient.trigger(conversation.id, "chat-message", {
        message,
        authorEmail: userEmail,
      });
      return {
        message,
      };
    },
  })
  .query("getConversations", {
    async resolve({ ctx }) {
      const userEmail = ctx.session.user?.email;
      if (!userEmail) throw new TRPCError({ code: "UNAUTHORIZED" });
      const conversations = await ctx.prisma?.chatConversation.findMany({
        where: {
          participants: { some: { user: { email: userEmail } } },
        },
        include: { participants: { include: { user: true } } },
      });
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
    },
  })
  .query("getConversation", {
    input: z.object({
      conversationId: z.string(),
    }),
    async resolve({ input, ctx }) {
      const userEmail = ctx.session.user?.email;
      if (!userEmail) throw new TRPCError({ code: "UNAUTHORIZED" });
      const conversation = await ctx.prisma.chatConversation.findFirst({
        where: {
          id: input.conversationId,
          participants: { some: { user: { email: userEmail } } },
        },
        include: conversationInclude,
      });
      return {
        conversation,
      };
    },
  })
  .mutation("createConversation", {
    input: z.object({
      participantEmails: z.array(z.string()),
    }),
    async resolve({ input, ctx }) {
      const userEmail = ctx.session.user?.email;
      if (!userEmail) throw new TRPCError({ code: "UNAUTHORIZED" });
      const allParticipantEmails = [...input.participantEmails, userEmail];
      const users = await ctx.prisma.user.findMany({
        select: { id: true },
        where: {
          email: { in: allParticipantEmails },
        },
      });
      const conversations = await ctx.prisma.chatConversation.findMany({
        where: {
          participants: {
            every: {
              user: { email: { in: allParticipantEmails } },
            },
          },
        },
        include: conversationInclude,
      });
      const existing = conversations.find(
        (conv) => conv.participants.length === allParticipantEmails.length
      );
      if (existing) return { conversation: existing };
      const conversation = await ctx.prisma.chatConversation.create({
        data: {},
      });
      const participants: ChatParticipant[] = [];
      for (const email of allParticipantEmails) {
        const participant = await ctx.prisma.chatParticipant.create({
          data: {
            conversation: { connect: { id: conversation.id } },
            user: { connect: { email: email } },
          },
          include: { user: true },
        });
        participants.push(participant);
      }
      return {
        conversation: { ...conversation, participants },
      };
    },
  });
