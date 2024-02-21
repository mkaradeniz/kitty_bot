import { isNotNullOrUndefined } from '@utils/misc/isNotNullOrUndefined';

import { type MyBotContext } from '../../middleware/contextMiddleware';

export const getChatIdFromContext = (ctx: MyBotContext) => {
  const chatId = ctx.myContext.chatId;

  if (!isNotNullOrUndefined(chatId)) {
    throw new Error('Could not get `chatId`.');
  }

  return chatId;
};
