import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const username = creds?.username?.toString() ?? "";
        const password = creds?.password?.toString() ?? "";
        if (!username || !password) return null;

        const user = await prisma.user.findUnique({ where: { username } });
        if (!user || !user.passwordHash) return null;
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name ?? user.username,
          email: user.email ?? undefined,
          image: user.image ?? undefined,
          role: user.role,
          username: user.username,
        } as unknown as any;
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).role = (user as any).role;
        (token as any).username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = (token as any).role;
        (session.user as any).username = (token as any).username;
        (session.user as any).id = (token as any).sub ?? (token as any).id;
      }
      return session;
    },
  },
};
