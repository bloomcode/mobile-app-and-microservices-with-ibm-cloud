#FROM node:11.12-alpine
FROM node:9.5-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

ENV PORT 8082
EXPOSE 8082

CMD [ "npm", "start" ]