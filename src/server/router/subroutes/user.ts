import { z } from 'zod';
import { t } from '../trpc';
import { protectedProcedure } from '../utils/protected-procedure';

export const userRouter = t.router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany({});
    return {
      users,
    };
  }),

  query: protectedProcedure
    .input(
      z.object({
        query: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!input.query) return { users: [] };
      const users = await ctx.prisma.user.findMany({
        where: {
          name: {
            search: `*${input.query}*`,
          },
        },
      });
      return {
        users,
      };
    }),
});
