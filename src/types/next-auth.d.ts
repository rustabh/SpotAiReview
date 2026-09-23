import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: "SUPER_ADMIN" | "BUSINESS_OWNER";
    status: string;
  }

  interface Session {
    user: {
      id: string;
      role: "SUPER_ADMIN" | "BUSINESS_OWNER";
      status: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "SUPER_ADMIN" | "BUSINESS_OWNER";
    status: string;
  }
}
