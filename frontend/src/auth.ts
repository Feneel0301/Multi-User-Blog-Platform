import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import axios from "axios";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google, // NextAuth automatically finds AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET in your .env.local
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const response = await axios.post(`${process.env.BACKEND_URL}/auth/login`, {
            email: credentials?.email,
            password: credentials?.password,
          });
          const user = response.data;
          if (user) return user;
          return null;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // The Interceptor: This runs the moment a user successfully authenticates with Google
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          // Verify we can successfully reach and sync with the backend
          await axios.post(`${process.env.BACKEND_URL}/auth/google`, {
            name: user.name,
            email: user.email,
          });
          return true;
        } catch (error) {
          console.error("Error verifying Google user backend sync in signIn:", error);
          return false; // Deny login if backend sync fails
        }
      }
      return true; // Allow standard email/password logins to proceed
    },
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        if (account?.provider === "google") {
          try {
            // Silently fetch database role and token from backend on first sign-in
            const response = await axios.post(`${process.env.BACKEND_URL}/auth/google`, {
              name: user.name,
              email: user.email,
            });
            token.role = response.data.role;
            token.accessToken = response.data.token;
          } catch (error) {
            console.error("Error syncing Google user with backend in jwt callback:", error);
          }
        } else {
          // Credentials login (user object already has role and token from backend login)
          token.role = (user as any).role;
          token.accessToken = (user as any).token;
        }
      }
      if (trigger === "update" && session) {
        if (session.role) token.role = session.role;
        if (session.token) token.accessToken = session.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).role = token.role;
        (session.user as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});