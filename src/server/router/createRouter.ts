import * as trpc from "@trpc/server";
import { Context } from "./context";

export function createProtectedRouter() {
  return trpc.router<Context>().middleware(({ ctx, next }) => {
    if (!prisma) throw new trpc.TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    if (!ctx.session) {
      throw new trpc.TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        ...ctx,
        // infers that `user` is non-nullable to downstream procedures
        session: ctx.session,
      },
    });
  });
}
