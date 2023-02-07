import createSendMessage from '../utils/message/createSendMessage';
import resetCurrentQuizDb from '../db/resetCurrentQuiz';

// Types
import { MyBotContext } from '../middleware/contextMiddleware';

const createResetCurrentQuizCommand = () => async (ctx: MyBotContext) => {
  try {
    const sendMessage = createSendMessage(ctx);

    await resetCurrentQuizDb();

    await sendMessage(`State was reset.`, { reply_to_message_id: ctx.message?.message_id });
  } catch (err) {
    console.error(err);
  }
};

export default createResetCurrentQuizCommand;
