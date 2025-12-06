import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { mockUsers } from "@/lib/mock-data";

export const authConfig = {
  session: {
    strategy: "jwt" as const,
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString().toLowerCase();
        const password = credentials?.password?.toString() ?? "";

        if (!email || !password) {
          return null;
        }

        const user = mockUsers.find(
          (u) => u.email.toLowerCase() === email && u.password === password,
        );

        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
