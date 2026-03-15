# ---------- BUILD STAGE ----------
FROM node:22-slim AS builder

WORKDIR /app

# install dependencies
COPY package*.json ./
RUN npm install

# copy project
COPY . .

# prisma
RUN npx prisma generate

# build nextjs
RUN npm run build


# ---------- PRODUCTION STAGE ----------
FROM node:22-slim

WORKDIR /app

# install system deps
RUN apt-get update && apt-get install -y \
python3 \
python3-pip \
python-is-python3 \
chromium \
curl \
ca-certificates \
--no-install-recommends \
&& rm -rf /var/lib/apt/lists/*

# verify python install
RUN python3 --version

# install python libs
RUN pip3 install --no-cache-dir rembg pillow onnxruntime --break-system-packages

# pre-download rembg model
RUN mkdir -p /root/.u2net && \
curl -L https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net.onnx \
-o /root/.u2net/u2net.onnx

# copy build output
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/server ./server
COPY --from=builder /app/scripts ./scripts

ENV NODE_ENV=production
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

EXPOSE 3000

