FROM node:24-bookworm-slim

WORKDIR /app

# Root files aur custom packages copy karo
COPY package*.json ./
COPY packages/ ./packages/

# Sirf account-api ka code copy karo
COPY services/account-api/ ./services/account-api/

# Uske andar ja kar install karo
WORKDIR /app/services/account-api
RUN npm install

EXPOSE 5010
CMD ["npm", "start"]