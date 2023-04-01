import { Logger } from '@nestjs/common';
import { CommandFactory } from 'nest-commander';
import { configPromise } from './app.module-config';
import { AppModule } from './app.module';

async function bootstrap() {
  const config = await configPromise;
  await CommandFactory.run(AppModule.forConfig(config) as any, new Logger());
}

bootstrap();
