FROM node:18-alpine

RUN apk update && apk add ffmpeg

WORKDIR /srv/server

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .


