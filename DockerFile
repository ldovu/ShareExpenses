FROM node:latest
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
RUN npm install -g nodemon
COPY ./app/package.json /usr/src/app
RUN npm install
COPY ./app /usr/src/app
EXPOSE 3000