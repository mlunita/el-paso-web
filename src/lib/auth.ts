import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
          console.warn("⚠️ WARNING: Missing ADMIN_EMAIL or ADMIN_PASSWORD in environment variables");
          return null;
        }

        // Strict validation: check credentials match EXACTLY against .env
        // (Avoiding Node.js 'crypto' module here to ensure Edge runtime compatibility)
        if (credentials.email === adminEmail && credentials.password === adminPassword) {
          // Success case
          return {
            id: "admin",
            email: adminEmail,
            role: "admin",
          };
        }

        // Invalid credentials
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.email = user.email; // explicitly store email to verify in middleware
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
};

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    throw new Error("Unauthorized");
  }

  return session;
}
