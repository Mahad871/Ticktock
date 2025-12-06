import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

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

        if (password !== "password") {
          return null;
        }

        return {
          id: "demo-user",
          email,
          name: "Demo User",
        };
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
