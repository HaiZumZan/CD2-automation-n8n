# ===== STAGE 1: Build React App =====
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy source và build production với env Docker
COPY . .
RUN cp .env.docker .env.production && npm run build

# ===== STAGE 2: Serve với Nginx =====
FROM nginx:alpine

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy cấu hình Nginx tùy chỉnh
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
