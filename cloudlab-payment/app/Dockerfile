FROM node:18-bullseye-slim
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production
COPY index.js .
COPY index.html .
EXPOSE 3000
CMD ["node", "index.js"]
