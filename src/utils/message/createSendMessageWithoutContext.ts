import { type Telegraf } from 'telegraf';
import { type ExtraReplyMessage } from 'telegraf/typings/telegram-types';

import { envConfig } from '@config/env';

import { isNotNullOrUndefined } from '@utils/misc/isNotNullOrUndefined';

const DEFAULT_MESSAGE_OPTIONS: ExtraReplyMessage = { parse_mode: 'HTML' };

// ! This only works if we have the `pubquizChatId` defined in the ENVs.
export const createSendMessageWithoutContext =
  (bot: Telegraf<any>) =>
  async (message: string, additionalMessageOptions: ExtraReplyMessage = {}) => {
    const chatId = envConfig.pubquizChatId;

    if (!isNotNullOrUndefined(chatId)) {
      return null;
    }

    const sentMessage = await bot.telegram.sendMessage(chatId, message, { ...DEFAULT_MESSAGE_OPTIONS, ...additionalMessageOptions });

    return sentMessage;
  };
