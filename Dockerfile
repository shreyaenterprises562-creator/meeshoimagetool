FROM node:22-slim

WORKDIR /app

# Install system deps for Playwright + Python
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
--no-install-recommends \
&& rm -rf /var/lib/apt/lists/*

# install python libs
RUN pip3 install --no-cache-dir rembg pillow --break-system-packages

# copy package
COPY package*.json ./

RUN npm install

# copy prisma
COPY prisma ./prisma

RUN npx prisma generate

# copy project
COPY . .

RUN npm run build

ENV NODE_ENV=production
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

CMD ["npm","start"]