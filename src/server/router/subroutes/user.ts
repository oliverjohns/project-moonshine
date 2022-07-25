import { TRPCError } from "@trpc/server";
import { t } from "../trpc";
import { protectedProcedure } from "../utils/protected-procedure";

export const userRouter = t.router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany({});
    return {
      users,
    };
  }),
});
