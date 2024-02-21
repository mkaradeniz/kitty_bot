import { type Telegraf } from 'telegraf';

import { BUTTONS_TUTORIAL } from '@config/constants';
import { envConfig } from '@config/env';
import { TEXT_TUTORIAL } from '@config/texts';

import { getOrCreateCurrentQuizDb } from '@db/getOrCreateCurrentQuiz';

import { logger } from '@utils/logger/logger';
import { createSendMessageWithoutContext } from '@utils/message/createSendMessageWithoutContext';
import { isNotNullOrUndefined } from '@utils/misc/isNotNullOrUndefined';

import { Emoji } from '@app-types/app';

export const createSendIntro = (bot: Telegraf<any>) => async () => {
  // ! This only works if we have the `pubquizChatId` defined in the ENVs.
  if (!isNotNullOrUndefined(envConfig.pubquizChatId)) {
    return;
  }

  try {
    const sendMessageWithoutContext = createSendMessageWithoutContext(bot);

    const currentQuiz = await getOrCreateCurrentQuizDb();

    await sendMessageWithoutContext(
      `${Emoji.Quiz} PUBBY QUIZZY PICKLE TIME ${Emoji.Quiz}\n\nWho's in for quizzy on the <b>${currentQuiz.dateFormatted}</B>?\n\n${TEXT_TUTORIAL}`,
      { ...BUTTONS_TUTORIAL },
    );

    logger.silly(`Intro sent.`, { label: 'src/message/sendIntro.ts:29' });
  } catch (err) {
    logger.error(err);
  }
};
