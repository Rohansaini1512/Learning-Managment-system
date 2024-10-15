# Use Node.js 21 image
FROM node:21

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the entire backend source code
COPY . .

# Expose port 5014 (since your backend runs on 5014)
EXPOSE 5014

# Start the backend server using npm run dev
CMD ["npm", "run", "dev"]
