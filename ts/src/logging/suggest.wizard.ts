import { Scenes, Telegraf, Markup } from 'telegraf';
import { TelegrafContext } from './types';
import { WizardScene } from 'telegraf/typings/scenes';
import { sendMessageWithPhoto } from './messages.service';

export function initSuggestWizard(
  bot: Telegraf<TelegrafContext>,
  chat: string,
): WizardScene<TelegrafContext> {
  return new Scenes.WizardScene<TelegrafContext>(
    'suggest_wizard',
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
          'З нетерпінням хочу побачити ваш пост на каналі! Почнімо.',
          Markup.inlineKeyboard([
            Markup.button.callback('❌ Скасувати', 'cancel'),
          ]),
        )
        .then(() => {
          ctx.reply(
            'Будь ласка, надішліть мені текст вашого посту і я його передам!',
          );
        });

      return ctx.wizard.next();
    },
    async (ctx) => {
      if (ctx.message && 'text' in ctx.message) {
        ctx.scene.session.form.post = ctx.message.text;
        ctx.replyWithMarkdown(
          'Дуже цікаво! А чи не хотіли б ви залишити картинку? Якщо так, надішліть її мені! Не забувайте, будь ласка, про авторські права.',
          Markup.inlineKeyboard([
            Markup.button.callback(
              'Я не маю картинки. Оберіть її самі, будь ласка.',
              'no_image',
            ),
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
          ctx.reply('Вааай, яка краса!').then(() => {
            ctx.reply(
              '🎉 Пост прийнято! Якщо виникнуть запитання, адміністрація напише вам в особисті повідомлення.',
            );
          });
          sendMessageWithPhoto(
            bot,
            chat,
            '🧧 Отримано новий пост від: ' +
              ctx.scene.session.form.userName +
              '\n' +
              'Тег: @' +
              ctx.scene.session.form.userTag +
              '\n' +
              'Пост: ' +
              ctx.scene.session.form.post +
              '\n' +
              'Картинка: ' +
              url.href,
            picture,
          );

          return ctx.scene.leave();
        });
      } else {
        ctx.reply('Надішліть, будь ласка, картинку. Дякую!');
      }
    },
  );
}
