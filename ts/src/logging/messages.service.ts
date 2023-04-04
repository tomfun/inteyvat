import { FmtString } from 'telegraf/src/format';
import * as tt from 'telegraf/src/telegram-types';
import { Telegraf } from 'telegraf';
import { TelegrafContext } from './types';

/**
 * Send message
 * @param bot
 * @param chat
 * @param text
 * @param extra
 */
export async function sendMessage(
  bot: Telegraf<TelegrafContext>,
  chat: string,
  text: string | FmtString,
  extra?: tt.ExtraReplyMessage,
) {
  return bot.telegram.sendMessage(chat, text, extra);
}

/**
 * Send message with picture
 * @param bot
 * @param chat
 * @param text
 * @param photo
 * @param extra
 */
export async function sendMessageWithPhoto(
  bot: Telegraf<TelegrafContext>,
  chat: string,
  text: string | FmtString,
  photo: string,
  extra?: tt.ExtraReplyMessage,
) {
  return bot.telegram.sendMessage(chat, text, extra).then(() => {
    bot.telegram.sendPhoto(chat, photo, extra);
  });
}
