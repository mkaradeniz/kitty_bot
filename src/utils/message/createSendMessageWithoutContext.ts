import envConfig from '../../config/env';
import isNotNullOrUndefined from '../misc/isNotNullOrUndefined';

// Types
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import { Telegraf } from 'telegraf';

const DEFAULT_MESSAGE_OPTIONS: ExtraReplyMessage = { parse_mode: 'HTML' };

// ! This only works if we have the `pubquizChatId` defined in the ENVs.
const createSendMessageWithoutContext =
  (bot: Telegraf) =>
  async (message: string, additionalMessageOptions: ExtraReplyMessage = {}) => {
    const chatId = envConfig.pubquizChatId;

    if (!isNotNullOrUndefined(chatId)) {
      return null;
    }

    const sentMessage = await bot.telegram.sendMessage(chatId, message, { ...DEFAULT_MESSAGE_OPTIONS, ...additionalMessageOptions });

    return sentMessage;
  };

export default createSendMessageWithoutContext;
