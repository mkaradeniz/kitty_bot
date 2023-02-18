import isNotNullOrUndefined from '../misc/isNotNullOrUndefined';

// Types
import { MyBotContext } from '../../middleware/contextMiddleware';

const getChatIdFromContext = (ctx: MyBotContext) => {
  const chatId = ctx.myContext.chatId;

  if (!isNotNullOrUndefined(chatId)) {
    throw new Error('Could not get `chatId`.');
  }

  return chatId;
};

export default getChatIdFromContext;
