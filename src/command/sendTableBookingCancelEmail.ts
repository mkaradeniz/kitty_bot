import { code, fmt } from 'telegraf/format';

import createCallback from '@utils/misc/createCallback';
import createSendAdminMessage from '@utils/message/createSendAdminMessage';
import createSendMessage from '@utils/message/createSendMessage';
import envConfig from '@config/env';
import getOrCreateCurrentQuizDb from '@db/getOrCreateCurrentQuiz';
import logger from '@utils/logger';
import sendTableBookingCancelEmail from '@utils/email/sendTableBookingCancelEmail';
import setEmailSentDb from '@db/setEmailSent';
import stringify from '@utils/misc/stringify';

// Types
import { Emoji } from '@types';
import { MyBotContext } from '@middleware/contextMiddleware';

const createSendTableBookingCancelEmail =
  (isCallback = false) =>
  async (ctx: MyBotContext) => {
    const callback = createCallback({ ctx, isCallback });

    try {
      const sendMessage = createSendMessage(ctx);
      const sendAdminMessage = createSendAdminMessage(ctx);

      const currentQuiz = await getOrCreateCurrentQuizDb();

      try {
        await sendTableBookingCancelEmail(currentQuiz.dateFormatted);

        await setEmailSentDb();

        await sendMessage(`${Emoji.Negative} I just sent ${envConfig.emailToName} a breakup letter (for this week).`);
      } catch (err) {
        logger.error(err);

        // ! This only works if we have the `adminUserId` defined in the ENVs.
        await sendAdminMessage(`Sending table booking cancel email failed.`);
        await sendAdminMessage(`Error was:`);
        await sendAdminMessage(fmt`${code(stringify(err as any, null, 2))}`);

        await sendMessage(`Mail sending failed. Please contact ${envConfig.emailToName} manually.`);
      }

      return callback();
    } catch (err) {
      logger.error(err);

      return callback();
    }
  };

export default createSendTableBookingCancelEmail;
