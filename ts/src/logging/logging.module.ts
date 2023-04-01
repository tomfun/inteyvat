import { Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { Global } from '@nestjs/common/decorators/modules/global.decorator';
import * as SendGridMailService from '@sendgrid/mail';

import { StrictConfigModule } from '../strict-config/strict-config.module';
import { InformService } from './inform.service';
import { LoggingConfig } from './logging.config';
import { MailService } from './mail.service';
import { TelegramService } from './telegram.service';
import { OnModuleInit } from '@nestjs/common/interfaces/hooks/on-init.interface';

@Global()
@Module({
  imports: [StrictConfigModule.forFeature({ Schema: LoggingConfig })],
  providers: [
    TelegramService,
    MailService,
    InformService,
    {
      provide: SendGridMailService as unknown as any,
      useFactory({ loggingSendgridApiKey }: LoggingConfig) {
        SendGridMailService.setApiKey(loggingSendgridApiKey);
        return SendGridMailService;
      },
      inject: [LoggingConfig],
    },
  ],
  exports: [InformService],
})
export class LoggingModule implements OnModuleDestroy, OnModuleInit {
  @Inject() telegramServices: TelegramService;

  async onModuleDestroy() {
    await this.telegramServices.stop();
  }

  onModuleInit(): any {
    return this.telegramServices.start();
  }
}
