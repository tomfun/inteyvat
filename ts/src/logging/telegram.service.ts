import { Injectable } from '@nestjs/common';
import { Telegraf, session, Scenes } from 'telegraf';
import { FmtString } from 'telegraf/src/format';
import * as tt from 'telegraf/src/telegram-types';
import { initAdminWizard } from './admin.wizard';
import { initContactWizard } from './contact.wizard';
import { initSuggestWizard } from './suggest.wizard';
import { LoggingConfig } from './logging.config';
import { TelegrafContext } from './types';
import { sendMessage } from './messages.service';

@Injectable()
export class TelegramService {
  private readonly bot: Telegraf<TelegrafContext>;
  private botLaunch: Promise<void>;
  private readonly chat: string;

  constructor(config: LoggingConfig) {
    this.chat = config.loggingTelegramChatId;
    this.bot = new Telegraf<TelegrafContext>(config.loggingTelegramBotToken);
    this.bot.use(session());

    const adminWizard = initAdminWizard(this.bot, this.chat);
    const contactWizard = initContactWizard(this.bot, this.chat);
    const suggestWizard = initSuggestWizard(this.bot, this.chat);

    const stage = new Scenes.Stage([adminWizard, contactWizard, suggestWizard]);

    stage.action('no_image_message', (ctx) => {
      if (!ctx.scene.session.form?.userTag || !ctx.scene.session.form?.post) {
        return ctx.scene.leave();
      }

      this.sendMessage(
        '📩 Отримано повідомлення від: ' + ctx.scene.session.form.userName + '\n' +
          'Тег: @' +
          ctx.scene.session.form.userTag +
          '\n' +
          'Текст: ' +
          ctx.scene.session.form.post,
      );
      ctx.reply('🎉 Повідомлення прийнято! Дякую!');
      return ctx.scene.leave();
    });

    stage.action('no_image', (ctx) => {
      if (!ctx.scene.session.form?.userTag || !ctx.scene.session.form?.post) {
        return ctx.scene.leave();
      }

      this.sendMessage(
        '🧧 Отримано новий пост від: ' + ctx.scene.session.form.userName + '\n' +
          'Тег: @' +
          ctx.scene.session.form.userTag +
          '\n' +
          'Пост: ' +
          ctx.scene.session.form.post,
      );
      ctx.reply(
        '🎉 Пост прийнято! Якщо виникнуть питання - адміністрація напише вам у особисті.',
      );
      return ctx.scene.leave();
    });

    stage.action('cancel', (ctx) => {
      ctx.reply('Повертаємося назад!');
      ctx.scene.leave();
      this.showStartMenu(ctx);
    });

    stage.command('cancel', (ctx) => {
      ctx.reply('Повертаємося назад!');
      ctx.scene.leave();
      this.showStartMenu(ctx);
    });

    this.bot.use(stage.middleware());
  }

  async sendMessage(text: string | FmtString, extra?: tt.ExtraReplyMessage) {
    return sendMessage(this.bot, this.chat, text, extra);
  }

  showStartMenu(ctx: TelegrafContext) {
    ctx.reply('Що вас цікавить?', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📝 Надіслати заявку на вступ до адміністрації', callback_data: 'administration' }],
          [{ text: '🧚‍ Запропонувати пост', callback_data: 'suggest' }],
          [{ text: '💌 Надіслати будь-що', callback_data: 'contact' }],
          [{ text: '🧭 Навігація по каналу', url: 'https://t.me/ua_genshin/922' }],
        ],
      },
    });
  }

  start() {
    if (this.botLaunch) {
      return this.botLaunch;
    }
    /** START ----------------------------------------------------------------------------------------------------*/
    this.bot.start((ctx: TelegrafContext) => {
      ctx
        .reply(
          '👋🏼 Вітаю, я бот каналу Інтейват! 🤖 Бодай я лише маленький ботик, та щосили намагатимуся вам допомогти!',
        )
        .then(() => {
          this.showStartMenu(ctx);
        });
    });

    /** ADMIN ACTION --------------------------------------------------------------------------------------------*/
    this.bot.action('administration', (ctx: TelegrafContext) => {
      ctx.scene.enter('admin_wizard');
    });

    /** SUGGEST ACTION ---------------------------------------------------------------------------------------------*/
    this.bot.action('suggest', (ctx: TelegrafContext) => {
      ctx.scene.enter('suggest_wizard');
    });

    /** CONTACT ACTION ---------------------------------------------------------------------------------------------*/
    this.bot.action('contact', (ctx: TelegrafContext) => {
      ctx.scene.enter('contact_wizard');
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
