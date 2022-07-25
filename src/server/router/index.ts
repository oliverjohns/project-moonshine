// src/server/router/index.ts
import { chatRouter } from "./subroutes/chat";
import { newQuestionRouter } from "./subroutes/question";
import { userRouter } from "./subroutes/user";
import { t } from "./trpc";

export const appRouter = t.router({
  questions: newQuestionRouter,
  chat: chatRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
