# Use lightweight Node image
FROM node:22-slim

# Install system dependencies for Playwright + Python
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python-is-python3 \
    wget \
    ca-certificates \
    libglib2.0-0 \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxcomposite1 \
    libxrandr2 \
    libxdamage1 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libgtk-3-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python background remover
RUN pip3 install --no-cache-dir rembg pillow --break-system-packages

WORKDIR /app

# Copy dependencies
COPY package*.json ./
COPY prisma ./prisma

# Install node packages
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Install Playwright chromium only
RUN npx playwright install chromium

# Copy project
COPY . .

# Build Next.js
RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start"]