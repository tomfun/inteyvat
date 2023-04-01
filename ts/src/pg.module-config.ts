import { NestFactory } from '@nestjs/core';

import { PgSchema } from './pg.schema';
import { BootstrapModule } from './strict-config/bootstrap.module';
import { CONFIG_OBJECT_TOKEN } from './strict-config/strict-config.constants';
import { StrictConfigModule } from './strict-config/strict-config.module';

const strictConfigForRoot = StrictConfigModule.forRoot({
  schemes: [],
  schema: PgSchema,
});

export const appPromise = NestFactory.createApplicationContext(
  BootstrapModule.boot({
    imports: [strictConfigForRoot],
  }),
);

async function bootstrap(): Promise<PgSchema> {
  const app = await appPromise;
  return app.get<PgSchema>(CONFIG_OBJECT_TOKEN);
}

export const pgConfigPromise = bootstrap();
