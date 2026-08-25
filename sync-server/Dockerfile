FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY index.html manifest.json sw.js robots.txt ./
COPY icons ./icons
COPY vendor ./vendor
COPY klang ./klang
COPY sticker ./sticker
COPY autoren ./autoren
COPY einlesung ./einlesung
COPY desktop/config.json ./desktop/config.json
COPY sync-server ./sync-server
ENV PORT=8787 VANI_DATA_DIR=/data
VOLUME ["/data"]
EXPOSE 8787
CMD ["node", "sync-server/server.mjs"]
