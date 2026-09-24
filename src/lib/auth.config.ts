import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config (no Prisma / bcrypt here) used by middleware.
 * The full config with the Credentials provider lives in `auth.ts`.
 */
export const authConfig: NextAuthConfig = {
  // Required behind a platform proxy (Vercel, custom domains, preview URLs):
  // without this, NextAuth rejects requests whose Host header doesn't
  // exactly match AUTH_URL/NEXTAUTH_URL, which silently bounces login back
  // to the sign-in page.
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      const isAdminRoute = pathname.startsWith("/admin");
      const isDashboardRoute = pathname.startsWith("/dashboard");

      if (isAdminRoute) {
        return isLoggedIn && auth?.user.role === "SUPER_ADMIN";
      }
      if (isDashboardRoute) {
        return isLoggedIn;
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "SUPER_ADMIN" | "BUSINESS_OWNER";
        session.user.status = token.status as string;
      }
      return session;
    },
  },
  providers: [],
};
