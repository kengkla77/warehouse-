// src/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config"; // ดึงค่าที่ตั้งไว้มาใช้
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig, // รวมร่างกับ config
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ username: z.string(), password: z.string() })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { username, password } = parsedCredentials.data;
          const user = await prisma.employee.findUnique({ where: { username } });
          
          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) {
            return {
              id: user.id.toString(),
              name: user.full_name,
              role: user.role,
              image: user.nickname,
            };
          }
        }
        return null;
      },
    }),
  ],
});