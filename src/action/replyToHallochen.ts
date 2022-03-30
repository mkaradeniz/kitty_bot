import getRandomHelloGif from '../utils/misc/getRandomHelloGif';
import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';

// Types
import { KittyBotContext } from '../middleware/contextMiddleware';

const replyToHallochen = async (ctx: KittyBotContext) => {
  const { chatId, message, user } = ctx.myContext;

  const messageId = message?.message_id;

  if (!isNotNullOrUndefined(messageId)) {
    return;
  }

  if (isNotNullOrUndefined(user) && user.id === 47647715) {
    try {
      await ctx.telegram.sendAnimation(
        chatId,
        'https://media1.giphy.com/media/dIBzteMy7M5H6iy7CX/giphy.gif?cid=790b761109a8d3ff6790e885fdc6b4e58e56b4bb9d918aec&rid=giphy.gif&ct=g',
        { reply_to_message_id: messageId },
      );
    } catch {
      // Do nothing
    }

    return;
  }

  try {
    await ctx.telegram.sendAnimation(chatId, getRandomHelloGif(), { reply_to_message_id: messageId });
  } catch {
    // Do nothing
  }
};

export default replyToHallochen;
