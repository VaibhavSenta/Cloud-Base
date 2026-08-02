FROM node:24-bookworm-slim
RUN apt-get update && apt-get install -y libc6 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY packages/ ./packages/
COPY apps/chat-portal/package.json ./apps/chat-portal/
COPY apps/chat-portal/ ./apps/chat-portal/

WORKDIR /app/apps/chat-portal
RUN npm install

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

EXPOSE 3001
CMD ["npm", "run", "dev"]
