import createSendGif from '../utils/message/createSendGif';
import getRandomFuckYouGif from '../utils/gifs/getRandomFuckYouGif';
import getRandomHelloGif from '../utils/gifs/getRandomHelloGif';
import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';

// Types
import { MyBotContext } from '../middleware/contextMiddleware';

const replyToHallochen = async (ctx: MyBotContext) => {
  try {
    const sendGif = createSendGif(ctx);

    const { message, user } = ctx.myContext;

    const messageId = message?.message_id;

    if (!isNotNullOrUndefined(messageId)) {
      return;
    }

    if (isNotNullOrUndefined(user) && user.id === 47647715) {
      try {
        await sendGif(getRandomFuckYouGif(), messageId);
      } catch {
        // Do nothing
      }

      return;
    }

    await sendGif(getRandomHelloGif(), messageId);
  } catch (err) {
    console.error(err);
  }
};

export default replyToHallochen;
