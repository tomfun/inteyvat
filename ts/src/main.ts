import * as events from 'events';

import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { join } from 'path';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import Server from 'fastify';
import { NestFactory } from '@nestjs/core';
import { HttpException, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { configPromise } from './app.module-config';

async function bootstrap() {
  const config = await configPromise;
  const server = Server({
    // @see https://www.fastify.io/docs/latest/Reference/Server/#trustproxy
    trustProxy: config.trustProxy,
    logger: true,
  });
  events.EventEmitter.defaultMaxListeners = 15;
  process.setMaxListeners(15);
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule.forConfig(config),
    new FastifyAdapter(server),
  );
  app.useStaticAssets({ root: join(__dirname, '..', '..', 'public') });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(
    new SentryInterceptor({
      filters: [
        {
          type: HttpException,
          filter: (exception: HttpException) => 500 > exception.getStatus(), // Only report 500 errors
        },
      ],
    }),
  );
  app.enableShutdownHooks();

  for (let i = 5; i >= 0; i--) {
    try {
      await app.listen(config.port, config.address);
      return;
    } catch (e) {
      if (e.code !== 'EADDRINUSE' || i === 0) {
        throw e;
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}
bootstrap();
