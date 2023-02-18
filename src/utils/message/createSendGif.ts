import getChatIdFromContext from '../context/getChatIdFromContext';
import isNotNullOrUndefined from '../misc/isNotNullOrUndefined';

// Types
import { MyBotContext } from '../../middleware/contextMiddleware';

const createSendGif = (ctx: MyBotContext) => async (gifUrl: string, replyId?: number) => {
  const chatId = getChatIdFromContext(ctx);

  const messageOptions = isNotNullOrUndefined(replyId) ? { reply_to_message_id: replyId } : {};

  const sentMessage = await ctx.telegram.sendAnimation(chatId, gifUrl, messageOptions);

  return sentMessage;
};

export default createSendGif;
