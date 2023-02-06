import envConfig from '../../config/env';
import isNotNullOrUndefined from '../misc/isNotNullOrUndefined';

// Types
import { MyBotContext } from '../../middleware/contextMiddleware';

// ! This only works if we have the `pubquizChatId` defined in the ENVs.
const createSendGifWithoutContext = (ctx: MyBotContext) => async (gifUrl: string, replyId?: number) => {
  const chatId = envConfig.pubquizChatId;

  if (!isNotNullOrUndefined(chatId)) {
    return null;
  }

  const messageOptions = isNotNullOrUndefined(replyId) ? { reply_to_message_id: replyId } : {};

  const sentMessage = await ctx.telegram.sendAnimation(chatId, gifUrl, messageOptions);

  return sentMessage;
};

export default createSendGifWithoutContext;
