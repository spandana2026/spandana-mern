# Spandana Care Aid Foundation — Dockerfile
FROM node:20-alpine AS frontend-builder

WORKDIR /build/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ .
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ── Production image ──────────────────────────────────────────────────────────
FROM node:20-alpine AS production

# Install serve for static files
RUN npm install -g pm2

WORKDIR /app

# Backend
COPY backend/package.json backend/package-lock.json* ./backend/
RUN cd backend && npm install --production
COPY backend/ ./backend/

# Frontend dist from builder
COPY --from=frontend-builder /build/frontend/dist ./frontend/dist

# PM2 config
COPY ecosystem.config.json .

# Create data and uploads directories
RUN mkdir -p backend/data backend/uploads /var/log/spandana

# Expose backend port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s \
  CMD wget -qO- http://localhost:5000/api/v1/docs || exit 1

CMD ["pm2-runtime", "start", "ecosystem.config.json"]
