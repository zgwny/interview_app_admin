# ── Stage 1: 编译 React 应用 ───────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# VITE_API_BASE 留空，由 Nginx 反代 /api 处理，无需硬编码后端地址
RUN npm run build

# ── Stage 2: Nginx 静态服务 ─────────────────────────────────────
FROM nginx:1.27-alpine AS runtime
# 移除默认站点配置
RUN rm /etc/nginx/conf.d/default.conf
# 注入 SPA + 反代配置
COPY nginx.conf /etc/nginx/conf.d/app.conf
# 拷贝构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]