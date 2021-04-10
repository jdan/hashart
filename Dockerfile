FROM ubuntu:latest

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update -y
# https://www.npmjs.com/package/canvas
RUN apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
RUN apt-get install -y nodejs npm

WORKDIR /app
ADD . .
RUN npm install --build-from-source

CMD ["node", "server.js"]
