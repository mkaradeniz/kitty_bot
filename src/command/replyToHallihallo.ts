import createSendGif from '@utils/message/createSendGif';
import isNotNullOrUndefined from '@utils/misc/isNotNullOrUndefined';
import logger from '@utils/logger';

// Types
import { MyBotContext } from '@middleware/contextMiddleware';

const replyToHallihallo = async (ctx: MyBotContext) => {
  try {
    const sendGif = createSendGif(ctx);

    const { message } = ctx.myContext;

    const messageId = message?.message_id;

    if (!isNotNullOrUndefined(messageId)) {
      return;
    }

    await sendGif(
      'https://media4.giphy.com/media/ULgyBIoljSnrnih7pJ/giphy.gif?cid=790b76112f6603b75be9db813ee4264cb72aba46265777fe&rid=giphy.gif&ct=g',
      messageId,
    );
  } catch (err) {
    logger.error(err);
  }
};

export default replyToHallihallo;
