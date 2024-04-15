# Use an official Node runtime as the base image
FROM node:16-bullseye

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Bundle app source
COPY . .

# Make port 3000 available to the world outside this container
EXPOSE 3000

RUN npx playwright install

# Run the app when the container launches
CMD ["npm", "start"]