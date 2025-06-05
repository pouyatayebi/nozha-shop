// lib/auth/options.ts

import NextAuth, { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient, Role } from "@/lib/generated/prisma";
import type { JWT } from "next-auth/jwt";
import prisma from "../prisma";



const authOptions: NextAuthConfig = {
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      id: "otp-credentials",
      name: "OTP Credentials",
      credentials: {
        phone: { label: "Phone", type: "text" },
        code: { label: "OTP Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("Missing credentials");
        }
        const { phone, code } = credentials as {
          phone: string;
          code: string;
        };

        // 1) Fetch the OTP record and validate
        const otpRecord = await prisma.otp.findUnique({ where: { phone } });
        if (
          !otpRecord ||
          otpRecord.code !== code ||
          otpRecord.expiresAt < new Date()
        ) {
          throw new Error("Invalid or expired OTP");
        }

        // 2) Delete the OTP (one-time use)
        await prisma.otp.delete({ where: { phone } });

        // 3) Find or create the User
        let user = await prisma.user.findUnique({ where: { phone } });
        if (!user) {
          user = await prisma.user.create({
            data: { phone, role: Role.USER },
          });
        }

        // 4) Return a minimal user object into the JWT
        return {
          id: user.id,
          phone: user.phone,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role: Role }).role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
  },

  debug: process.env.NODE_ENV === "development",
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
