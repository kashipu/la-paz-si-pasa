FROM node:22-alpine AS builder
WORKDIR /app

ARG WORDPRESS_URL
ARG PUBLIC_SITE_URL
ENV WORDPRESS_URL=${WORDPRESS_URL}
ENV PUBLIC_SITE_URL=${PUBLIC_SITE_URL}

COPY apps/frontend/package.json apps/frontend/package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY apps/frontend/ ./
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV HOST=0.0.0.0
ENV PORT=80

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 80
CMD ["node", "./dist/server/entry.mjs"]
