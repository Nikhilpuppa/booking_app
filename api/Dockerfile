FROM node:21

# Create app directory
WORKDIR /app

# Install nodemon globally
RUN npm install -g nodemon

# Install app dependencies
COPY ./package.json /app
COPY ./package-lock.json /app
RUN npm ci

# Bundle app source
COPY . /app

# Set environment variables (can be overridden in Docker Compose if needed)

# Expose the application port
EXPOSE 4000

# Run nodemon to start the app with index.js
CMD ["nodemon", "index.js"]
