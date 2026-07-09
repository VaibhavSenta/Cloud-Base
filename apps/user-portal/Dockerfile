FROM node:24-bookworm-slim
RUN apt-get update && apt-get install -y libc6 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Root dependencies aur package copy
COPY package*.json ./
COPY packages/ ./packages/
COPY apps/user-portal/package.json ./apps/user-portal/

# App code copy
COPY apps/user-portal/ ./apps/user-portal/

WORKDIR /app/apps/user-portal
RUN npm install

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000
CMD ["npm", "run", "dev"]