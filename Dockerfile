FROM node:16-alpine

WORKDIR /app

COPY . .

RUN npm config set registry https://registry.npmjs.org

RUN npm install && npm run build

EXPOSE 3000

CMD ["npm", "start"]