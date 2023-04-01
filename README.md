
## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Config

create `.env` file credentials, docker compose take it only
if you are in the **api** directory:
```bash
docker compose up -d
```

## Installation

```bash
npm install
```

## Migrations

```bash
# Via npx with ts-node compilation on fly
docker compose run api \
  npx typeorm-ts-node-commonjs \
  migration:run \
  -d ts/src/pg.data-source.ts
# OR short
docker compose run api \
  npm run typeorm:migration:run
```

```bash
# open PostgreSQL
docker compose exec -it postgres psql postgres --username=inteyvat
```

## Fixtures

https://github.com/RobinCK/typeorm-fixtures

```bash
docker compose run api \
  npm run fixtures
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# docker
# see config notes ^
docker compose up api

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov

# docker 
docker compose run api \
  npm run <command>
# docker test:e2e
docker compose run api \
  npm run test:e2e
```
