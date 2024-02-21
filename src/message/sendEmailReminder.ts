import { Markup, type Telegraf } from 'telegraf';

import { envConfig } from '@config/env';

import { getOrCreateCurrentQuizDb } from '@db/getOrCreateCurrentQuiz';

import { logger } from '@utils/logger/logger';
import { createSendMessageWithoutContext } from '@utils/message/createSendMessageWithoutContext';
import { getButtonFromCallbackType } from '@utils/misc/getButtonFromCallbackType';
import { isNotNullOrUndefined } from '@utils/misc/isNotNullOrUndefined';

import { CallbackType, Emoji } from '@app-types/app';

export const createSendEmailReminder = (bot: Telegraf<any>) => async () => {
  // ! This only works if we have the `pubquizChatId` defined in the ENVs.
  if (!isNotNullOrUndefined(envConfig.pubquizChatId)) {
    return;
  }

  try {
    const sendMessageWithoutContext = createSendMessageWithoutContext(bot);

    const currentQuiz = await getOrCreateCurrentQuizDb();

    if (currentQuiz.isEmailSent) {
      logger.silly(`Email reminder not sent because email is already sent.`, { label: 'src/message/sendEmailReminder.ts:26' });

      return;
    }

    await sendMessageWithoutContext(
      `⚠️ We still haven't sent ${envConfig.emailToName} the mail with our table size. ⚠️
Send a ${Emoji.EmailBook} or click the button below to send it now. `,
      {
        ...Markup.inlineKeyboard([
          Markup.button.callback(getButtonFromCallbackType(CallbackType.SendBookingEmail), CallbackType.SendBookingEmail),
        ]),
      },
    );

    logger.silly(`Email reminder sent.`, { label: 'src/message/sendEmailReminder.ts:41' });
  } catch (err) {
    logger.error(err);
  }
};
