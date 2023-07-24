# Use an official Node.js runtime as the base image
FROM node:18-alpine
 
# Set the working directory in the container
WORKDIR /app
 
# Copy package.json and package-lock.json to the container
COPY package*.json ./
 
# Install app dependencies
RUN npm install
 
# Copy the application code to the container
COPY . .
 
# Expose the port that the Express app listens on
EXPOSE 3000
 
# Start the Express app
CMD ["node", "app.js"]