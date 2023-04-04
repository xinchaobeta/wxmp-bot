FROM node:18.15.0

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY package*.json /app/
COPY .npmrc /app/
RUN pnpm i

COPY . /app
CMD ["pnpm", "start"]
