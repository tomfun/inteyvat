FROM node:18.15-alpine3.17

WORKDIR /app/api

CMD ["node", "--trace-warnings", "--enable-source-maps", "dist/src/main"]

COPY package*.json ./

RUN npm --loglevel warn --color=always install

COPY . .

RUN npm --loglevel warn --color=always run build

