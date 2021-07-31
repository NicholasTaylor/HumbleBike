FROM node:16.6.0-alpine3.11

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY package.json ./
COPY package-lock.json ./
RUN npm install

# This helps avoid EACCES permission errors that can happen in Node images.
RUN chown -R node.node /app

COPY . ./

CMD ["npm", "start"]