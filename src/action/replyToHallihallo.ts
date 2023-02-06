import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';

// Types
import { KittyBotContext } from '../middleware/contextMiddleware';

const replyToHallihallo = async (ctx: KittyBotContext) => {
  try {
    const { chatId, message } = ctx.myContext;

    const messageId = message?.message_id;

    if (!isNotNullOrUndefined(messageId)) {
      return;
    }

    await ctx.telegram.sendAnimation(
      chatId,
      'https://media4.giphy.com/media/ULgyBIoljSnrnih7pJ/giphy.gif?cid=790b76112f6603b75be9db813ee4264cb72aba46265777fe&rid=giphy.gif&ct=g',
      {
        reply_to_message_id: messageId,
      },
    );
  } catch (err) {
    console.error(err);
  }
};

export default replyToHallihallo;
