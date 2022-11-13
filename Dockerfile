FROM node:16
WORKDIR /usr/src/app
RUN apt install git
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3332
RUN npm install -g @vue/cli
CMD [ "npm", "run", "dev" ]
