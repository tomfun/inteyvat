import { Injectable } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { FmtString } from 'telegraf/src/format';
import * as tt from 'telegraf/src/telegram-types';

import { LoggingConfig } from './logging.config';

@Injectable()
export class TelegramService {
  private readonly bot: Telegraf;
  private botLaunch: Promise<void>;
  private readonly chat: string;

  constructor(config: LoggingConfig) {
    this.chat = config.loggingTelegramChatId;
    this.bot = new Telegraf(config.loggingTelegramBotToken);
  }

  async sendMessage(text: string | FmtString, extra?: tt.ExtraReplyMessage) {
    return this.bot.telegram.sendMessage(this.chat, text, extra);
  }

  start() {
    if (this.botLaunch) {
      return this.botLaunch;
    }
    this.bot.start((ctx) => {
      ctx.reply('Hello ' + ctx.from.first_name + '!\nchat is ' + ctx.chat.id);
    });
    this.bot.help((ctx) => ctx.reply('May say hello'));
    this.bot.on('text', (ctx) => {
      console.log(' ctx ', ctx);
      ctx.reply('I am alive' + (ctx.from.username === 'tomfun' ? ', sir' : ''));
    });
    return (this.botLaunch = this.bot.launch());
  }

  stop() {
    if (!this.botLaunch) {
      return;
    }
    this.bot.stop();
  }
}
