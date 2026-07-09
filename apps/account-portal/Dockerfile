# 1. Base image (Debian based, glibc supported)
FROM node:24-bookworm-slim

# 2. Compile karne ke liye zaroori libraries install karo
RUN apt-get update && apt-get install -y libc6 && rm -rf /var/lib/apt/lists/*

# 3. Workdir set karo
WORKDIR /app

# 4. Root se saari zaroori files copy karo
COPY package*.json ./
COPY packages/ ./packages/
COPY apps/account-portal/package.json ./apps/account-portal/

# 5. App ka source code copy karo
COPY apps/account-portal/ ./apps/account-portal/

# 6. Install dependencies
WORKDIR /app/apps/account-portal
RUN npm install

# 7. Next.js settings
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

EXPOSE 3001
CMD ["npm", "run", "dev"]