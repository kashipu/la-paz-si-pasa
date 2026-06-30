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

FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/astro/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
