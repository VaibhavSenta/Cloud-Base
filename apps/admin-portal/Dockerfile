FROM node:24-bookworm-slim
RUN apt-get update && apt-get install -y libc6 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY packages/ ./packages/
COPY apps/admin-portal/package.json ./apps/admin-portal/
COPY apps/admin-portal/ ./apps/admin-portal/

WORKDIR /app/apps/admin-portal
RUN npm install

ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

EXPOSE 3002
CMD ["npm", "run", "dev"]