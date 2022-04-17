FROM node:16.14.2
WORKDIR /src
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
RUN npm ci --also=dev
COPY src ./src
COPY tsconfig.json ./tsconfig.json
RUN npm run build
CMD ["node", "./dist/index.js"]
