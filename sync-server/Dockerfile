FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY index.html manifest.json sw.js faden.enc ./
COPY icons ./icons
COPY desktop/config.json ./desktop/config.json
COPY sync-server ./sync-server
ENV PORT=8787 VANI_DATA_DIR=/data
VOLUME ["/data"]
EXPOSE 8787
CMD ["node", "sync-server/server.mjs"]
