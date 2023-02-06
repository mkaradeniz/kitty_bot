import { Markup } from 'telegraf';

import createSendMessageWithoutContext from '../../utils/message/createSendMessageWithoutContext';
import envConfig from '../../config/env';
import getOrCreateCurrentQuizDb from '../../db/getOrCreateCurrentQuiz';
import isNotNullOrUndefined from '../../utils/misc/isNotNullOrUndefined';
import { CALLBACK_TYPE_SEND_EMAIL } from '../../config/constants';
import { EMOJI_EMAIL } from '../../config/texts';

// Types
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
      `⚠️ We still haven't sent ${envConfig.emailToName} the mail with table size. ⚠️\n\nSend a ${EMOJI_EMAIL} or click the button below to send it now. `,
      {
        ...Markup.inlineKeyboard([Markup.button.callback(EMOJI_EMAIL, CALLBACK_TYPE_SEND_EMAIL)]),
      },
    );
  } catch (err) {
    console.error(err);
  }
};

export default createSendEmailReminder;
