FROM node:10 as base

WORKDIR /app

COPY . .

RUN yarn install

FROM node:alpine

WORKDIR /app

COPY --from=base /app /app

EXPOSE 3000

CMD ["yarn", "start"]
