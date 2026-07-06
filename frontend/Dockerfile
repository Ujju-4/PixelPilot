FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install --frozen-lockfile

COPY index.html vite.config.ts tsconfig*.json postcss.config.js tailwind.config.js ./
COPY public ./public
COPY src ./src

RUN npm run build

# ── Serve stage ───────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

# Copy the Vite production build.
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx config: serve the SPA, proxy /api to the backend.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -qO- http://localhost/favicon.svg || exit 1

CMD ["nginx", "-g", "daemon off;"]
