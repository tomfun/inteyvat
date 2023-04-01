import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SentryModule } from '@ntegral/nestjs-sentry';

import { AppSchema } from './app.schema';
import { strictConfigForRoot } from './app.module-config';
import { config as typeOrmConfig } from './pg.config-factory';

import { TournamentController } from './tournament/tournament.controller';
import { FormModule } from './form/form.module';
import { LoggingModule } from './logging/logging.module';
import { entities } from './entity';
import { TournamentService } from './tournament/tournament.service';

@Module({})
export class AppModule {
  static forConfig(config: AppSchema): DynamicModule {
    return {
      module: AppModule,
      imports: [
        HttpModule,
        strictConfigForRoot,
        SentryModule.forRoot({
          enabled: !config.sentryDisable,
          dsn: config.sentryDsn,
          debug: false,
          environment: config.ENVIRONMENT,
          release: `api@${config.VERSION}`,
          close: { enabled: true },
        }),
        TypeOrmModule.forRoot(typeOrmConfig(config)),
        TypeOrmModule.forFeature(entities),
        FormModule,
        LoggingModule,
      ],

      controllers: [TournamentController],
      providers: [
        TournamentService,
        {
          provide: APP_PIPE,
          useClass: ValidationPipe,
        },
      ],
    };
  }
}
