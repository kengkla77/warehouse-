// src/auth.config.ts
import type { NextAuthConfig } from "next-auth";

// ประกาศ Type (คงเดิม)
declare module "next-auth" {
  interface User {
    role?: string;
    nickname?: string;
  }
  interface Session {
    user: {
      role?: string;
      nickname?: string;
    } & import("next-auth").DefaultSession["user"]
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: string;
    nickname?: string;
  }
}

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith('/login');

      // 1. ถ้าอยู่ที่หน้า Login แต่จริงๆ ล็อกอินค้างไว้อยู่แล้ว
      if (isOnLogin) {
        if (isLoggedIn) {
           // ดีดไปหน้าแรก (/) ทันที
           return Response.redirect(new URL('/', nextUrl));
        }
        return true; // ถ้ายังไม่ล็อกอิน ก็ให้อยู่หน้า Login ต่อไป
      }

      // 2. ถ้าไม่ได้อยู่ที่หน้า Login (เช่นอยู่ / หรือ /operations) และยังไม่ล็อกอิน
      if (!isLoggedIn) {
        return false; // ดีดไปหน้า Login อัตโนมัติ
      }

      // 3. ถ้าล็อกอินแล้ว -> อนุญาตให้เข้าได้ทุกหน้า 
      // (ไม่ต้องดัก Redirect Store แล้ว เพราะเราอยากให้เขาเข้าหน้าแรกได้)
      return true;
    },

    // ส่วน JWT และ Session (คงเดิม ถูกต้องแล้ว)
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as string | undefined;
        token.nickname = user.nickname as string | undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string | undefined;
        session.user.nickname = token.nickname as string | undefined;
      }
      return session;
    },
  },
  
  providers: [], 

} satisfies NextAuthConfig;