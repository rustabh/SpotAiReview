import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { prisma } from "./prisma";
import { rateLimit } from "./rate-limit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const normalizedEmail = email.toLowerCase().trim();
        const limit = rateLimit(`login:${normalizedEmail}`, 8, 10 * 60 * 1000);
        if (!limit.allowed) return null;

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });
        if (!user) return null;
        if (user.status === "SUSPENDED") return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
        };
      },
    }),
    Credentials({
      id: "impersonate",
      name: "Impersonate",
      credentials: { token: { label: "Token", type: "text" } },
      authorize: async (credentials) => {
        const token = credentials?.token as string | undefined;
        if (!token) return null;

        const record = await prisma.impersonationToken.findUnique({ where: { token } });
        if (!record || record.usedAt || record.expiresAt < new Date()) return null;

        const user = await prisma.user.findUnique({ where: { id: record.targetUserId } });
        if (!user || user.status === "SUSPENDED") return null;

        await prisma.impersonationToken.update({
          where: { id: record.id },
          data: { usedAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
});
