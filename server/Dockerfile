# Use Node.js 18 Alpine as base image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Generate Prisma client
RUN npx prisma generate

# Development stage
FROM base AS development

# Install all dependencies including dev dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start development server
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Start production server
CMD ["npm", "start"]