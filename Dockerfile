# syntax=docker/dockerfile:1
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend ./

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

COPY --from=backend-builder /app/backend ./backend

EXPOSE 5000
WORKDIR /app/backend
CMD ["node", "server.js"]

