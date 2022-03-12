# syntax=docker/dockerfile:1

FROM node:16.11.0
EXPOSE 3000
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json","package-lock.json","./"]
RUN npm install
COPY . .
CMD ["node", "./bin/www"]
