# Use a Node.js base image (adjust version as needed)
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install  # Or: yarn install

# Copy the rest of the application source code
COPY . .

# Build the React application for production
RUN npm run build  # Or: yarn build  (This command should be defined in your package.json)

# --- Production Stage ---

# Use a lightweight web server (e.g., nginx) to serve the static files
FROM nginx:alpine

# Copy the built application from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80 (default for nginx)
EXPOSE 80

# Optionally, customize the nginx configuration (see below)

# Command to start nginx (usually not needed, but explicit for clarity)
CMD ["nginx", "-g", "daemon off;"]