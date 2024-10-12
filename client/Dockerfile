# Use the official Node.js image to build the frontend
FROM node:20

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the entire frontend source code
COPY . .

# Build the frontend (optional if you're not building)
# RUN npm run build

# Expose the correct port (if it's running on port 5173)
EXPOSE 5173

# Start the frontend server with 'npm run dev'
CMD ["npm", "run", "dev"]
