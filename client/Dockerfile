FROM node:21

# Create app directory
WORKDIR /app

# Install dependencies
COPY ./package.json /app
COPY ./yarn.lock /app
RUN yarn install

# Bundle app source
COPY . /app

# Expose the application port
EXPOSE 5173

# Run the frontend development server and bind to 0.0.0.0
# CMD ["yarn", "run", "dev", "--host"]
