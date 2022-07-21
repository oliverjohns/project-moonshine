import { createProtectedRouter } from "./createRouter";
export const userRouter = createProtectedRouter().query("getUsers", {
  async resolve({ ctx }) {
    const users = await ctx.prisma.user.findMany({});
    return {
      users,
    };
  },
});
