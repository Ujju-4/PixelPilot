FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:22-alpine AS production

# Install system deps for the Python background-removal + OCR sidecar.
RUN apk add --no-cache \
    python3 \
    py3-pip \
    py3-numpy \
    tesseract-ocr \
    # OpenCV headless requires these shared libs
    libstdc++ \
    libgomp

# Install opencv-python-headless via pip (numpy already installed via apk).
RUN pip3 install --break-system-packages opencv-python-headless==4.13.0.92

WORKDIR /app

# Copy only production-needed files.
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY scripts ./scripts
COPY package.json ./

# Create storage directories.
RUN mkdir -p uploads outputs storage/history

# Run as a non-root user.
RUN addgroup -S pixelpilot && adduser -S pixelpilot -G pixelpilot
RUN chown -R pixelpilot:pixelpilot /app
USER pixelpilot

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:4000/api/health || exit 1

CMD ["node", "dist/server.js"]
