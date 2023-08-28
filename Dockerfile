FROM node:17-slim as builder

WORKDIR /tmp 

WORKDIR /home/node/app

EXPOSE 1060

CMD [ "npm", "start" ]