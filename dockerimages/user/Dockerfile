FROM node:11.12-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

ENV PORT 8080
EXPOSE 8080

CMD [ "npm", "start" ]