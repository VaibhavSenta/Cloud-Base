FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY packages/ ./packages/
COPY services/chat-api/ ./services/chat-api/

WORKDIR /app/services/chat-api
RUN npm install --only=production

EXPOSE 5006
CMD ["npm", "start"]
