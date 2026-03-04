# Use official Node image
FROM node:22-bullseye

# Install Python + pip
RUN apt-get update && \
    apt-get install -y python3 python3-pip python-is-python3 && \
    apt-get clean

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./
COPY prisma ./prisma

# Install Node dependencies
RUN npm install

# 🔥 Generate Prisma Client
RUN npx prisma generate

# Install Playwright browsers
RUN npx playwright install --with-deps

# Copy entire project
COPY . .

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 8080

# Start app
CMD ["npm", "run", "start"]