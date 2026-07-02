import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      status: string;
    };
  }
  interface User {
    id: string;
    email: string;
    role: string;
    status: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    status: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Dynamic imports keep Mongoose out of the static bundle —
        // these modules are only loaded at runtime on the server.
        const { connectDB } = await import("./db");
        const { default: User } = await import("@/models/User");

        await connectDB();

        const user = await User.findOne({
          email: (credentials.email as string).toLowerCase(),
          deletedAt: null,
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) return null;

        // Auto-reactivate if suspension has expired
        if (
          user.status === "SUSPENDED" &&
          user.suspendedUntil &&
          user.suspendedUntil < new Date()
        ) {
          user.status = "ACTIVE";
          user.suspendedUntil = null;
          user.suspendedReason = null;
          await user.save();
        }

        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      // On sign-in, embed role and status into the JWT
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
      }
      return token;
    },
    session({ session, token }) {
      // Expose id, role, status on session.user
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.status = token.status;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
  },
});
