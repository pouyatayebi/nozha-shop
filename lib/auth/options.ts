// lib/auth/options.ts

import NextAuth, { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient, Role } from "@/lib/generated/prisma";
import type { JWT } from "next-auth/jwt";
import prisma from "../prisma";

const authOptions: NextAuthConfig = {
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // در هنگام لاگین، role را از user بگیر
      if (user) {
        token.id = user.id;
        token.role = user.role;
        return token;
      }

      // بقیهٔ فراخوانی‌ها: نقش را از DB رفرش کن
      const dbUser = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: { role: true },
      });

      if (dbUser) token.role = dbUser.role;
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  providers: [
    CredentialsProvider({
      id: "otp-credentials",
      name: "OTP Credentials",
      credentials: {
        phone: { label: "Phone", type: "text" },
        code: { label: "OTP Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) throw new Error("Missing credentials");
        let { phone, code } = credentials as { phone: string; code: string };

        // ۱) نرمال‌سازی
        phone = phone.trim();
        code = code.trim();

        // ۲) واکشی OTP
        const otp = await prisma.otp.findUnique({ where: { phone } });

        if (!otp || otp.code !== code || otp.expiresAt < new Date()) {
          console.log("authorize - mismatch");
          throw new Error("Invalid or expired OTP");
        }

        // ۳) حذف (در صورت وجود) - خطا را نادیده بگیر
        // await prisma.otp.delete({ where: { phone } }).catch(() => {});

        // ۴) یافتن یا ساخت کاربر
        let user = await prisma.user.findUnique({ where: { phone } });
        if (!user) {
          user = await prisma.user.create({ data: { phone, role: Role.USER } });
        }

        return { id: user.id, phone: user.phone, role: user.role };
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
