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

# Expose the application port
EXPOSE 5173

# Set the default command to start the frontend development server
CMD ["yarn", "dev"]
