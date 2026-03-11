# ---------- BUILD STAGE ----------
FROM node:22-slim AS builder

WORKDIR /app

# install dependencies
COPY package*.json ./
RUN npm install

# copy full project
COPY . .

# generate prisma client
RUN npx prisma generate

# build nextjs
RUN npm run build


# ---------- PRODUCTION STAGE ----------
FROM node:22-slim

WORKDIR /app

# Install minimal deps for chromium + python
RUN apt-get update && apt-get install -y \
python3 \
python3-pip \
python-is-python3 \
chromium \
--no-install-recommends \
&& rm -rf /var/lib/apt/lists/*

# install python libs
RUN pip3 install --no-cache-dir rembg pillow onnxruntime --break-system-packages

# copy build output
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# worker + backend files
COPY --from=builder /app/server ./server

# ✅ IMPORTANT (python scripts)
COPY --from=builder /app/scripts ./scripts

ENV NODE_ENV=production
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

EXPOSE 3000

CMD ["npm","start"]