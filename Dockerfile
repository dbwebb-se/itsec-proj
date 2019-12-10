FROM node:12

RUN apt-get update

WORKDIR /app

COPY package*.json ./

RUN npm install

ENTRYPOINT ["npm"]

CMD ["start"]
