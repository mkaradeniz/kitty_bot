import { envConfig } from '@config/env';

import { getChatIdFromContext } from '@utils/context/getChatIdFromContext';
import { logger } from '@utils/logger/logger';
import { isNotNullOrUndefined } from '@utils/misc/isNotNullOrUndefined';

import { type MyBotContext } from '../../middleware/contextMiddleware';

export const createSendGif = (ctx: MyBotContext) => async (gifUrl: string, replyId?: number) => {
  const chatId = getChatIdFromContext(ctx);

  if (chatId !== envConfig.pubquizChatId) {
    logger.silly(`Message was being sent to an unknown group. Ignoring.`, { label: 'src/message/createSendGif.ts:13' });

    return;
  }

  const messageOptions = isNotNullOrUndefined(replyId) ? { reply_to_message_id: replyId } : {};

  const sentMessage = await ctx.telegram.sendAnimation(chatId, gifUrl, messageOptions);

  return sentMessage;
};
