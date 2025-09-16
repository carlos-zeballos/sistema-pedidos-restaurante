# Use Node.js 18 Alpine
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY src/backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/backend/ .

# Build the application
RUN npm run build

# Expose port
EXPOSE 10000

# Start the application
CMD ["node", "dist/main.js"]

