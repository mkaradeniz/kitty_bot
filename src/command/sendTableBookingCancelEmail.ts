import { code, fmt } from 'telegraf/format';

import createSendAdminMessage from '../utils/message/createSendAdminMessage';
import createSendMessage from '../utils/message/createSendMessage';
import envConfig from '../config/env';
import getOrCreateCurrentQuizDb from '../db/getOrCreateCurrentQuiz';
import logger from '../utils/logger';
import sendTableBookingCancelEmail from '../utils/email/sendTableBookingCancelEmail';
import setEmailSentDb from '../db/setEmailSent';
import stringify from '../utils/misc/stringify';
import { EMOJI_NEGATIVE } from '../config/texts';

// Types
import { MyBotContext } from '../middleware/contextMiddleware';

const createSendTableBookingCancelEmail = () => async (ctx: MyBotContext) => {
  try {
    const sendMessage = createSendMessage(ctx);
    const sendAdminMessage = createSendAdminMessage(ctx);

    const currentQuiz = await getOrCreateCurrentQuizDb();

    try {
      await sendTableBookingCancelEmail(currentQuiz.dateFormatted);

      await setEmailSentDb();

      await sendMessage(`${EMOJI_NEGATIVE} I just sent ${envConfig.emailToName} a breakup letter (for this week).`);
    } catch (err) {
      logger.error(err);

      // ! This only works if we have the `adminUserId` defined in the ENVs.
      await sendAdminMessage(`Sending table booking cancel email failed.`);
      await sendAdminMessage(`Error was:`);
      await sendAdminMessage(fmt`${code(stringify(err as any, null, 2))}`);

      await sendMessage(`Mail sending failed. Please contact ${envConfig.emailToName} manually.`);
    }
  } catch (err) {
    logger.error(err);
  }
};

export default createSendTableBookingCancelEmail;
