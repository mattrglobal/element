FROM node:10.16 AS base
EXPOSE 5002

FROM base as deps
WORKDIR /usr/app
COPY package.json package-lock.json ./
RUN npm install

FROM base as build
WORKDIR /usr/app
COPY --from=deps /usr/app/node_modules /usr/app/node_modules
COPY . ./

FROM socialengine/nginx-spa
COPY --from=build /usr/app/build /app
CMD ["npm","run","build:standalone"]
