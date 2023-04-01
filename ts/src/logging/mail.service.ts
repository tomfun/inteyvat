import { Inject, Injectable } from '@nestjs/common';
import { MailDataRequired } from '@sendgrid/helpers/classes/mail';
import * as SendGridMailService from '@sendgrid/mail';

import { InjectConfig } from '../strict-config/strict-config.decorator';
import { LoggingConfig } from './logging.config';

@Injectable()
export class MailService {
  @Inject(SendGridMailService)
  private readonly sendgrid: typeof SendGridMailService;
  @InjectConfig<LoggingConfig>('loggingSendgridEmailFrom')
  private readonly from: string;
  @InjectConfig<LoggingConfig>('loggingSendgridEmailTo')
  private readonly to: string;

  async sendMessage(
    msg: Omit<MailDataRequired, 'from'> &
      Partial<Pick<MailDataRequired, 'from'>>,
  ) {
    return this.sendgrid.send({
      from: this.from,
      to: this.to,
      subject: 'inteyvat',
      ...msg,
    } as MailDataRequired);
  }
}
