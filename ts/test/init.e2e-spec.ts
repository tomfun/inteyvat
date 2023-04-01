import * as events from 'events';

import { ValidationPipe } from '@nestjs/common';
import { ConsoleLogger } from '@nestjs/common/services/console-logger.service';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import Server from 'fastify';
import { InjectOptions } from 'light-my-request';
import { Scope } from 'nock';
import * as nock from 'nock';
import { AppSchema } from '../src/app.schema';
import { MailService } from '../src/logging/mail.service';
import { TelegramService } from '../src/logging/telegram.service';
import { BootstrapModule } from '../src/strict-config/bootstrap.module';
import { CONFIG_OBJECT_TOKEN } from '../src/strict-config/strict-config.constants';
import { StrictConfigModule } from '../src/strict-config/strict-config.module';
import { AppModule } from './../src/app.module';
import { FormConfig } from '../src/form/form.config';

const TIMER_MAX = 5000;

describe('init (e2e)', () => {
  let config: AppSchema;
  const TOKEN = '123';
  const telegram = {
    sendMessage: jest.fn(),
    stop: jest.fn(),
  } as Pick<TelegramService, 'sendMessage'>;
  const mailer = {
    sendMessage: jest.fn(),
  } as Pick<MailService, 'sendMessage'>;
  let app: NestFastifyApplication;
  const logger = new ConsoleLogger();

  beforeAll(async () => {
    logger.setLogLevels(['error', 'warn']);
    events.EventEmitter.defaultMaxListeners = 14;
    process.setMaxListeners(14);
    const strictConfigForRoot = StrictConfigModule.forRoot<any, any>({
      schemes: [FormConfig],
      schema: AppSchema,
    });

    const appConfig = await Test.createTestingModule({
      imports: [
        BootstrapModule.boot({
          imports: [strictConfigForRoot],
        }),
      ],
    }).compile();
    config = appConfig.get<AppSchema>(CONFIG_OBJECT_TOKEN);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule.forConfig(config)],
    })
      .setLogger(logger)
      .overrideProvider(TelegramService)
      .useValue(telegram)
      .overrideProvider(MailService)
      .useValue(mailer)
      .compile();

    const server = Server({
      trustProxy: 0,
      logger: config.logHttp,
    });
    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(server),
      { logger },
    );
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    if (config.log === '1') {
      logger.setLogLevels(['log', 'debug', 'error', 'verbose', 'warn']);
    }
  });

  afterEach(() => expect(nock.isDone()).toBeTruthy());
  afterEach(() => nock.cleanAll());
  afterEach(() => app.flushLogs());

  afterAll(async function () {
    await app.close();
  }, TIMER_MAX * 10);

  const createdFormId = null;
  const createdOrderId = null;
  let createdOrderExternalId = null;

  it(`POST /api/order 400`, () => {
    return app
      .inject({
        method: 'POST',
        url: '/api/order',
        headers: {
          Authorization: TOKEN,
        },
        payload: {},
      })
      .then((result) => {
        expect(result.statusCode).toEqual(400);
        expect(result.json()).toHaveProperty('message');
        expect(result.json()).toHaveProperty(
          'error',
          expect.stringMatching('Bad Request'),
        );
      });
  });

  it(`POST /api/order 201`, () => {
    createdOrderExternalId = (Math.random() * 1000000).toString();
    const payload = {
      name: createdOrderExternalId,
    };
    return app
      .inject({
        method: 'POST',
        url: '/api/order',
        headers: {
          Authorization: TOKEN,
        },
        payload,
      })
      .then((result) => {
        expect(result.statusCode).toEqual(201);
        const createdTournament = result.json();
        expect(createdTournament).toMatchObject({
          name: createdOrderExternalId,
        });
      });
  });
});
