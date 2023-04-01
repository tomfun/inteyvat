import { Inject, Injectable } from '@nestjs/common';
import { TournamentEntity } from '../entity';
import { InjectConfig } from '../strict-config/strict-config.decorator';
import { LoggingConfig } from './logging.config';
import { MailService } from './mail.service';
import { TelegramService } from './telegram.service';

@Injectable()
export class InformService {
  @InjectConfig<LoggingConfig>('loggingSilentForPerInstance')
  private readonly silentForSeconds: number;
  private lastByType = {} as Record<string, number>;
  @Inject()
  private readonly telegramService: TelegramService;
  @Inject()
  private readonly mailService: MailService;

  async notifyNotEnoughBalance(
    tournament: Pick<TournamentEntity, 'id' | 'name'>,
  ) {
    const now = Date.now() / 1000;
    const actionName = this.notifyNotEnoughBalance.name;
    if (
      this.lastByType[actionName] &&
      this.lastByType[actionName] + this.silentForSeconds > now
    ) {
      return;
    }
    const subject = '⚠️ Some things 💸';
    const header = `form ${tournament?.id})`;
    const text = `${subject} for ${header}. ${tournament?.name}`;
    const html = `<html><body>
<h3>${subject}</h3>
<h5>${header}</h5>
<p>Sss:</p>
<p>${text}</p>
</body></html>`;
    const t = this.telegramService.sendMessage(text);
    const e = this.mailService.sendMessage({
      html,
      text,
      subject,
    });
    await Promise.all([t, e]); // parallel sending. at least 1 service ok
    this.lastByType[actionName] = now;
  }
}
