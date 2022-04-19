FROM node:16-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN node ./deploy-commands
CMD ["node", "index.js"]
EXPOSE 3000