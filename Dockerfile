# syntax=docker/dockerfile:1

# ---------- Build Stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm ci

ENV NODE_ENV=production
ENV NEXT_DISABLE_ESLINT=1
ENV NEXT_TELEMETRY_DISABLED=1

COPY . .
RUN npm run build

# ---------- Runtime Stage ----------
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_DISABLE_ESLINT=1

# Create non-root user
RUN adduser -D -u 1001 nextjs

# Copy only required build output (standalone mode)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
USER nextjs

# Jalankan output standalone dari Next.js
CMD ["node", "server.js"]
