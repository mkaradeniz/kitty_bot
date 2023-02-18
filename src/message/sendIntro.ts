import createSendMessageWithoutContext from '../utils/message/createSendMessageWithoutContext';
import envConfig from '../config/env';
import getOrCreateCurrentQuizDb from '../db/getOrCreateCurrentQuiz';
import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';
import logger from '../utils/logger';
import { BUTTONS_TUTORIAL } from '../config/constants';
import { EMOJI_QUIZ, TEXT_TUTORIAL } from '../config/texts';

// Types
import { Telegraf } from 'telegraf';

const createSendIntro = (bot: Telegraf<any>) => async () => {
  // ! This only works if we have the `pubquizChatId` defined in the ENVs.
  if (!isNotNullOrUndefined(envConfig.pubquizChatId)) {
    return;
  }

  try {
    const sendMessageWithoutContext = createSendMessageWithoutContext(bot);

    const currentQuiz = await getOrCreateCurrentQuizDb();

    await sendMessageWithoutContext(
      `${EMOJI_QUIZ} PUBBY QUIZZY PICKLE TIME ${EMOJI_QUIZ}\n\nWho's in for quizzy on the <b>${currentQuiz.dateFormatted}</B>?\n\n${TEXT_TUTORIAL}`,
      {
        ...BUTTONS_TUTORIAL,
      },
    );
  } catch (err) {
    logger.error(err);
  }
};

export default createSendIntro;
