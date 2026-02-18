# ใช้ Node.js version 18 (Alpine คือเวอร์ชันน้ำหนักเบา)
FROM node:18-alpine AS base

# ติดตั้งแพ็กเกจที่จำเป็นสำหรับ Prisma ให้ทำงานบน Alpine ได้
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# --- 1. ติดตั้ง Dependencies ---
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm install
# Generate Prisma Client ทันทีหลังลงแพ็กเกจเสร็จ
RUN npx prisma generate

# --- 2. Build โปรเจกต์ ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# สร้างไฟล์ Build ของ Next.js
RUN npm run build

# --- 3. รันโปรเจกต์ (Production) ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# ก๊อปปี้ไฟล์ที่ Build เสร็จแล้วมาใช้งาน
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# สั่งรันแอปพลิเคชัน
CMD ["node", "server.js"]