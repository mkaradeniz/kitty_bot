import { type ExtraReplyMessage } from 'telegraf/typings/telegram-types';

import { envConfig } from '@config/env';

import { getChatIdFromContext } from '@utils/context/getChatIdFromContext';
import { logger } from '@utils/logger/logger';

import { type MyBotContext } from '../../middleware/contextMiddleware';

const DEFAULT_MESSAGE_OPTIONS: ExtraReplyMessage = { parse_mode: 'HTML' };

export const createSendMessage =
  (ctx: MyBotContext) =>
  async (message: string, additionalMessageOptions: ExtraReplyMessage = {}) => {
    const chatId = getChatIdFromContext(ctx);

    if (chatId !== envConfig.pubquizChatId) {
      logger.silly(`Message was being sent to an unknown group. Ignoring.`, { label: 'src/message/createSendMessage.ts:17' });

      return;
    }

    const sentMessage = await ctx.telegram.sendMessage(chatId, message, { ...DEFAULT_MESSAGE_OPTIONS, ...additionalMessageOptions });

    return sentMessage;
  };
