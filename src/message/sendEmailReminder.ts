import { Markup } from 'telegraf';

import createSendMessageWithoutContext from '@utils/message/createSendMessageWithoutContext';
import envConfig from '@config/env';
import getButtonFromCallbackType from '@utils/misc/getButtonFromCallbackType';
import getOrCreateCurrentQuizDb from '@db/getOrCreateCurrentQuiz';
import isNotNullOrUndefined from '@utils/misc/isNotNullOrUndefined';
import logger from '@utils/logger';

// Types
import { CallbackType, Emoji } from '@types';
import { Telegraf } from 'telegraf';

const createSendEmailReminder = (bot: Telegraf<any>) => async () => {
  // ! This only works if we have the `pubquizChatId` defined in the ENVs.
  if (!isNotNullOrUndefined(envConfig.pubquizChatId)) {
    return;
  }

  try {
    const sendMessageWithoutContext = createSendMessageWithoutContext(bot);

    const currentQuiz = await getOrCreateCurrentQuizDb();

    if (currentQuiz.isEmailSent) {
      return;
    }

    await sendMessageWithoutContext(
      `⚠️ We still haven't sent ${envConfig.emailToName} the mail with our table size. ⚠️\n\nSend a ${Emoji.EmailBook} or click the button below to send it now. `,
      {
        ...Markup.inlineKeyboard([
          Markup.button.callback(getButtonFromCallbackType(CallbackType.SendBookingEmail), CallbackType.SendBookingEmail),
        ]),
      },
    );

    logger.silly(`Email reminder sent.`, { label: 'src/message/sendEmailReminder.ts' });
  } catch (err) {
    logger.error(err);
  }
};

export default createSendEmailReminder;
