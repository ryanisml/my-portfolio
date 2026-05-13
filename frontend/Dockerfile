FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL
ARG RECAPTCHA_SITE_VALUE=

RUN VITE_API_BASE_URL="${VITE_API_BASE_URL}" VITE_RECAPTCHA_SITE_KEY="${RECAPTCHA_SITE_VALUE}" npm run build

FROM nginx:1.27-alpine

COPY frontend.nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

RUN printf '%s\n' '#!/bin/sh' \
	'set -eu' \
	'' \
	'cat > /usr/share/nginx/html/config.js <<EOF' \
	'window.__APP_CONFIG__ = {' \
	'  VITE_API_BASE_URL: "${VITE_API_BASE_URL:-}",' \
	'  VITE_RECAPTCHA_SITE_KEY: "${VITE_RECAPTCHA_SITE_KEY:-}",' \
	'}' \
	'EOF' \
	> /docker-entrypoint.d/40-runtime-config.sh \
	&& chmod +x /docker-entrypoint.d/40-runtime-config.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
