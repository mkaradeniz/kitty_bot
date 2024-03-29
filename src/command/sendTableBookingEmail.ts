import { code, fmt } from 'telegraf/format';

import { envConfig } from '@config/env';

import { getOrCreateCurrentQuizDb } from '@db/getOrCreateCurrentQuiz';
import { setEmailSentDb } from '@db/setEmailSent';

import { type MyBotContext } from '@middleware/contextMiddleware';

import { sendTableBookingEmail } from '@utils/email/sendTableBookingEmail';
import { logger } from '@utils/logger/logger';
import { createSendAdminMessage } from '@utils/message/createSendAdminMessage';
import { createSendMessage } from '@utils/message/createSendMessage';
import { createCallback } from '@utils/misc/createCallback';
import { stringify } from '@utils/misc/stringify';
import { getPlayersPlayingCount } from '@utils/state/getPlayersPlayingCount';

import { Emoji } from '@app-types/app';

export const createSendTableBookingEmail =
  (isCallback = false) =>
  async (ctx: MyBotContext) => {
    const callback = createCallback({ ctx, isCallback });

    try {
      const sendMessage = createSendMessage(ctx);
      const sendAdminMessage = createSendAdminMessage(ctx);

      const currentQuiz = await getOrCreateCurrentQuizDb();
      const playersPlayingCount = getPlayersPlayingCount(currentQuiz);

      if (currentQuiz.isEmailSent) {
        await sendMessage(`We alreadyt sent an email to ${envConfig.emailToName}. If you want to cancel, type <code>!cancel</code>.`);

        return callback();
      }

      if (playersPlayingCount === 0) {
        await sendMessage(`Are you sure? We have no players yet. If you want to cancel, type <code>!cancel</code>.`);

        return callback();
      }

      try {
        await sendTableBookingEmail({ date: currentQuiz.dateFormatted, playersPlayingCount });

        await setEmailSentDb();

        await sendMessage(`${Emoji.EmailBook} I just sent ${envConfig.emailToName} a (love-)letter.`);
      } catch (err) {
        logger.error(err);

        // ! This only works if we have the `adminUserId` defined in the ENVs.
        await sendAdminMessage(`Sending table booking email failed.`);
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
