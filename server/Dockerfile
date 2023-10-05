FROM node:20.7.0-alpine
WORKDIR /app

# install dependencies
COPY package*.json .
RUN npm install

# copy the project files into the working directory
COPY . .

# run the development version
RUN NODE_ENV=production
# start the server
RUN npm start
