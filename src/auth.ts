import type { NextAuthOptions, User as NextAuthUser, Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import type { JWT } from "next-auth/jwt";

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
      async authorize(creds): Promise<NextAuthUser | null> {
        const username = creds?.username?.toString() ?? "";
        const password = creds?.password?.toString() ?? "";
        if (!username || !password) return null;

        const user = await prisma.user.findUnique({ where: { username } });
        if (!user || !user.passwordHash) return null;
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        const authUser: NextAuthUser = {
          id: user.id,
          name: user.name ?? user.username,
          email: user.email ?? undefined,
          image: user.image ?? undefined,
        };
        // Extra fields stored in JWT below
        (authUser as unknown as { role?: string; username?: string }).role = user.role;
        (authUser as unknown as { username?: string }).username = user.username;
        return authUser;
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      const t = token as JWT & { role?: string; username?: string };
      const u = user as (NextAuthUser & { role?: string; username?: string }) | undefined;
      if (u) {
        t.role = u.role;
        t.username = u.username;
      }
      return t;
    },
    async session({ session, token }) {
      const t = token as JWT & { role?: string; username?: string; sub?: string };
      const s = session as Session & { user: Session["user"] & { role?: string; username?: string; id?: string } };
      if (s.user) {
        s.user.role = t.role;
        s.user.username = t.username;
        s.user.id = t.sub ?? (s.user.id as string | undefined);
      }
      return s;
    },
  },
};
