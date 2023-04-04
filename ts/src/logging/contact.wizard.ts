import { Scenes, Telegraf, Markup } from 'telegraf';
import { TelegrafContext } from './types';
import { WizardScene } from 'telegraf/typings/scenes';
import { sendMessageWithPhoto } from './messages.service';

export function initContactWizard(
  bot: Telegraf<TelegrafContext>,
  chat: string,
): WizardScene<TelegrafContext> {
  return new Scenes.WizardScene<TelegrafContext>(
    'contact_wizard',
    async (ctx) => {
      ctx.replyWithMarkdown(
        'Сюди можна надіслати щось на конкурс або з будь-яких інших питаннь каналу.',
        Markup.inlineKeyboard([
          Markup.button.callback('❌ Скасувати', 'cancel'),
        ]),
      );
      const chatId = ctx.chat?.id;
      const userName = ctx.from?.first_name || ctx.from?.username;
      const userTag = ctx.from?.username;
      ctx.scene.session.form = {
        chatId,
        userName,
        userTag,
      };
      ctx.reply('Слухаю вас!');
      return ctx.wizard.next();
    },
    async (ctx) => {
      if (ctx.message && 'text' in ctx.message) {
        ctx.scene.session.form.post = ctx.message.text;
        ctx.replyWithMarkdown(
          'Зрозуміло! Чи треба вам залишити картинку? Якщо так, то надішліть її мені!',
          Markup.inlineKeyboard([
            Markup.button.callback('У мене нема картинки.', 'no_image_message'),
          ]),
        );
        return ctx.wizard.next();
      } else {
        ctx.reply('Опишіть, будь ласка, словами. Дякую!');
      }
    },
    async (ctx) => {
      if (ctx.message && 'photo' in ctx.message) {
        const picture = ctx.message.photo[1].file_id;
        bot.telegram.getFileLink(picture).then((url) => {
          ctx.reply('Гаразд!');
          sendMessageWithPhoto(
            bot,
            chat,
            '📩 Отримано повідомлення від: ' +
              ctx.scene.session.form.userName +
              '\n' +
              'Тег: @' +
              ctx.scene.session.form.userTag +
              '\n' +
              'Текст: ' +
              ctx.scene.session.form.post +
              '\n' +
              'Картинка: ' +
              url.href,
            picture,
          );
          ctx.reply('🎉 Повідомлення прийнято! Дякую!');
          return ctx.scene.leave();
        });
      } else {
        ctx.reply('Надішліть, будь ласка, картинку. Дякую!');
      }
    },
  );
}
