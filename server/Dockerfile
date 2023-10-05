FROM node:20.7.0-alpine
WORKDIR /app

# install dependencies
COPY package*.json .
RUN npm install

# copy the project files into the working directory
COPY . .

# start the server after the container is initialized
ENTRYPOINT npm start
