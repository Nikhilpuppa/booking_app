FROM node:21

# Create app directory
WORKDIR /app

# Install nodemon globally
RUN npm install -g nodemon

# Install app dependencies
COPY ./package.json /app
COPY ./package-lock.json /app
RUN npm ci
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . /app

# Expose the application port
EXPOSE 5002

# Run nodemon to start the app with index.js
CMD ["nodemon", "index.js"]
