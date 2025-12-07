import NextAuth, { type Session, type User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import { mockUsers } from "@/lib/mock-data";

export const authConfig = {
  pages: {
    signIn: "/",
    signOut: "/",
  },
  session: {
    strategy: "jwt" as const,
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember me", type: "checkbox" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString().toLowerCase();
        const password = credentials?.password?.toString() ?? "";
        const rememberMe =
          credentials?.rememberMe === true ||
          credentials?.rememberMe === "true";

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
          rememberMe,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User | undefined }) {
      // On sign-in, persist rememberMe and set a per-session expiry
      if (user && "rememberMe" in user) {
        const remember = Boolean((user as Record<string, unknown>).rememberMe);
        const ttlSeconds = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 12; // 30d vs 12h
        token.rememberMe = remember;
        token.exp = Math.floor(Date.now() / 1000) + ttlSeconds;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        (session.user as Record<string, unknown>).rememberMe = Boolean(
          (token as Record<string, unknown>).rememberMe,
        );
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
