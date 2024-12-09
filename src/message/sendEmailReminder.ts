import { Markup, type Telegraf } from 'telegraf';

import { envConfig } from '@config/env';

import { getOrCreateCurrentQuizDb } from '@db/getOrCreateCurrentQuiz';

import { logger } from '@utils/logger/logger';
import { createSendMessageWithoutContext } from '@utils/message/createSendMessageWithoutContext';
import { getButtonFromCallbackType } from '@utils/misc/getButtonFromCallbackType';
import { isNotNullOrUndefined } from '@utils/misc/isNotNullOrUndefined';
import { getPlayersPlayingCount } from '@utils/state/getPlayersPlayingCount';

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

    const playersPlayingCount = getPlayersPlayingCount(currentQuiz);

    const whatEmailWillBeSend =
      playersPlayingCount < envConfig.minPlayersThreshold
        ? `Currently, the automatic email would cancel our table, since we're below the threshold of ${envConfig.minPlayersThreshold} players.`
        : `Currently, the automatic mail would confirm our table, since we have at least ${envConfig.minPlayersThreshold} players`;

    await sendMessageWithoutContext(
      `${Emoji.Warning} We still haven't sent ${envConfig.emailToName} the email with our table size. ${Emoji.Warning} 
Send an email ${Emoji.EmailBook} or click the button below to send it now. If we don't do it by 00:00 on Monday, an email will be sent automatically. ${whatEmailWillBeSend}.`,
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
