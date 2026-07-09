FROM node:24-bookworm-slim
RUN apt-get update && apt-get install -y libc6 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY packages/ ./packages/
COPY services/admin-api/ ./services/admin-api/

WORKDIR /app/services/admin-api
RUN npm install

EXPOSE 5001
CMD ["npm", "start"]