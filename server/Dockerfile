FROM node:20.7.0-alpine

# install bash
RUN apk update && apk add bash

# working directories
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

# install dependencies
COPY package*.json ./

# ensure that all of the application files are owned by the non-root node user
RUN npm install

# copy the project files into the working directory
COPY . .

# expose the port the server listens to
EXPOSE 8000

# start the server after the container is initialized
CMD ["npm", "start"]
