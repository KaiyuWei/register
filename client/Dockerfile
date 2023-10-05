FROM node:20.7.0-alpine

# install bash
RUN apk update && apk add bash

# working directories
RUN mkdir -p /home/node/app/node_modules
WORKDIR /home/node/app

# install dependencies
COPY package*.json ./

# install bash
RUN apk update && apk add bash

# ensure that all of the application files are owned by the non-root node user
RUN npm install

# copy the project files into the working directory
COPY . .

# expose the port
EXPOSE 3000

# start the server after the container is initialized
ENTRYPOINT ["npm", "start"]
