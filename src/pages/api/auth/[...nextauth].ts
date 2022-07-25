import NextAuth, { type NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db/client";

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  theme: {
    colorScheme: "light", // "auto" | "dark" | "light"
    brandColor: "#a78bfa", // Hex color code
    //logo: "logo.png", // Absolute URL to image
    buttonText: "#f1f5f9", // Hex color code
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    // ...add more providers here
    // CredentialsProvider({
    //   name: "Credentials",
    //   credentials: {
    //     name: {
    //       label: "Email",
    //       type: "text",
    //     },
    //     password: {
    //       label: "Password",
    //       type: "password",
    //       placeholder: "",
    //     },
    //   },
    //   async authorize(credentials, _req) {
    //     const user = { id: 1, name: credentials?.name ?? "J Smith" };

    //     return user;
    //   },
    // }),
  ],
};

export default NextAuth(authOptions);
