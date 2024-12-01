FROM node:21

# Create app directory
WORKDIR /app

# Install app dependencies
COPY ./package.json /app
COPY ./yarn.lock /app

RUN yarn install
# If you are building your code for production
# RUN yarn install --production

# Bundle app source
COPY . /app

EXPOSE 3000
CMD [ "yarn", "dev" ]
