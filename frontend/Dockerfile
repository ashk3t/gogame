FROM node:21
WORKDIR /gogame-frontend
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
CMD [ "npm", "run", "preview" ]