# =========================================
# Base — dependencies and source (shared)
# =========================================
FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .

# =========================================
# Dev — Vite dev server with HMR
# =========================================
FROM base AS dev
ENV NODE_ENV=development
ENV HOST=0.0.0.0
ENV PORT=3001
EXPOSE 3001
CMD ["npm", "run", "dev"]

FROM base AS builder
ENV NODE_ENV=production
RUN npm run build

# =========================================
# Runner — production Nitro server
# =========================================
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0
COPY --from=builder --chown=node:node /app/.output ./output
USER node
EXPOSE 3001
CMD ["node", "output/server/index.mjs"]