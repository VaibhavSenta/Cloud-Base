FROM node:24-bookworm-slim
RUN apt-get update && apt-get install -y libc6 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Root dependencies aur package copy
COPY package*.json ./
COPY packages/ ./packages/
COPY services/user-api/ ./services/user-api/

WORKDIR /app/services/user-api
RUN npm install

EXPOSE 5005
CMD ["npm", "start"]