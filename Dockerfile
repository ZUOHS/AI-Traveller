# syntax=docker/dockerfile:1.7

FROM node:20-bullseye AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
COPY packages/common/package.json packages/common/package.json
RUN npm install

FROM deps AS builder
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/packages ./packages
COPY package-lock.json .
RUN npm prune --omit=dev

EXPOSE 8080
CMD ["npm", "--workspace", "backend", "run", "start"]
