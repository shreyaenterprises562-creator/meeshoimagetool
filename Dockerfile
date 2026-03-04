FROM node:22-slim

# Install system dependencies + chromium
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python-is-python3 \
    chromium \
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

# Install python libs
RUN pip3 install --no-cache-dir rembg pillow --break-system-packages

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm install

RUN npx prisma generate

# 🔴 IMPORTANT
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["npm","run","start"]