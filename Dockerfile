#1. Building Stage / Container
FROM node:22-slim AS builder
WORKDIR /usr/local/app

#Installing dependencies
COPY package*.json ./
RUN npm install


#Copy source code to docker image and expose port 3000
COPY . .
RUN npm run build:server 

#2. Deployment Stage / Container
FROM node:22-slim AS deploy
WORKDIR /usr/local/app

COPY package.json ./
RUN npm install --omit=dev

COPY --from=builder /usr/local/app/node/dist ./build

EXPOSE 3000

CMD ["node", "build/server.js"]