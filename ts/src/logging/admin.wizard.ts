import { Scenes, Telegraf, Markup } from 'telegraf';
import { TelegrafContext } from './types';
import { WizardScene } from 'telegraf/typings/scenes';
import { sendMessage } from './messages.service';

export function initAdminWizard(
  bot: Telegraf<TelegrafContext>,
  chat: string,
): WizardScene<TelegrafContext> {
  return new Scenes.WizardScene<TelegrafContext>(
    'admin_wizard',
    async (ctx) => {
      const chatId = ctx.chat?.id;
      const userName = ctx.from?.first_name || ctx.from?.username;
      const userTag = ctx.from?.username;
      ctx.scene.session.form = {
        chatId,
        userName,
        userTag,
      };

      ctx
        .replyWithMarkdown(
          'Щоб залишити заявку, дайте відповідь на декілька запитань, будь ласка.',
          Markup.inlineKeyboard([
            Markup.button.callback('❌ Скасувати заявку', 'cancel'),
          ]),
        )
        .then(() => {
          ctx.reply('Скільки часу ви готові присвячувати каналу на день?');
        });

      return ctx.wizard.next();
    },
    async (ctx) => {
      if (ctx.message && 'text' in ctx.message) {
        ctx.scene.session.form.time = ctx.message.text;
        ctx.reply('Дякую! Підкажіть, що ви вмієте?');
        return ctx.wizard.next();
      } else {
        ctx.reply('Опишіть, будь ласка, словами. Дякую!');
      }
    },
    async (ctx) => {
      if (ctx.message && 'text' in ctx.message) {
        ctx.scene.session.form.knowledge = ctx.message.text;
        ctx.reply(
          'Зрозуміло! А чим би хотіли займатися на каналі? (лор, цікавинки, ґайди, тощо)',
        );
        return ctx.wizard.next();
      } else {
        ctx.reply('Опишіть, будь ласка, словами. Дякую!');
      }
    },
    async (ctx) => {
      if (ctx.message && 'text' in ctx.message) {
        ctx.scene.session.form.topics = ctx.message.text;
        ctx.reply('Ого, цікаво! Дякую!').then(() => {
          ctx.reply(
            '🎉 Заявку прийнято! З вами скоро звʼяжуться. \nℹ️ Інформація, що була передана: \n' +
              info,
          );
        });

        const info =
          'Тег: @' +
          ctx.scene.session.form.userTag +
          '\n' +
          'Час на день: ' +
          ctx.scene.session.form.time +
          '\n' +
          'Вміння: ' +
          ctx.scene.session.form.knowledge +
          '\n' +
          'Теми: ' +
          ctx.scene.session.form.topics;

        sendMessage(
          bot,
          chat,
          '⛑ Отримано нову заявку на вступ до адмінки від: ' +
            ctx.scene.session.form.userName + '\n' + info,
        );

        return ctx.scene.leave();
      } else {
        ctx.reply('Опишіть, будь ласка, словами. Дякую!');
      }
    },
  );
}
