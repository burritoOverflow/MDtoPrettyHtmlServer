FROM node:10.13-alpine
ENV NODE_ENV production
WORKDIR /usr/src/app
RUN apk add zip unzip
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --global --unsafe-perm exp markdown-styles
RUN npm install  && mv node_modules ../
COPY . .
EXPOSE 9000
CMD node index.js
