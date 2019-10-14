FROM node:12

RUN apt-get update

WORKDIR /app

COPY package*.json ./

RUN npm install

CMD ["npm", "start"]
