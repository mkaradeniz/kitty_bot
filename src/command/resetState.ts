import { resetCurrentQuizDb } from '@db/resetCurrentQuiz';

import { type MyBotContext } from '@middleware/contextMiddleware';

import { logger } from '@utils/logger/logger';
import { createSendMessage } from '@utils/message/createSendMessage';
import { createCallback } from '@utils/misc/createCallback';

export const createResetCurrentQuizCommand =
  (isCallback = false) =>
  async (ctx: MyBotContext) => {
    const callback = createCallback({ ctx, isCallback });

    try {
      const sendMessage = createSendMessage(ctx);

      await resetCurrentQuizDb();

      await sendMessage(`State was reset.`, { reply_to_message_id: ctx.message?.message_id });

      return callback();
    } catch (err) {
      logger.error(err);

      return callback();
    }
  };
