FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:22-alpine AS production

RUN apk add --no-cache \
    python3 \
    py3-pip \
    py3-numpy \
    py3-opencv \
    tesseract-ocr \
    libstdc++ \
    libgomp

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY scripts ./scripts
COPY package*.json ./

RUN mkdir -p uploads outputs storage/history

RUN addgroup -S pixelpilot && adduser -S pixelpilot -G pixelpilot
RUN chown -R pixelpilot:pixelpilot /app
USER pixelpilot

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:4000/api/health || exit 1

CMD ["node", "dist/server.js"]