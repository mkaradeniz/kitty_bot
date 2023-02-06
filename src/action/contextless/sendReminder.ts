import pluralize from 'pluralize';

import createSendMessageWithoutContext from '../../utils/message/createSendMessageWithoutContext';
import envConfig from '../../config/env';
import getOrCreateCurrentQuizDb from '../../db/getOrCreateCurrentQuiz';
import getPlayersPlayingCount from '../../utils/state/getPlayersPlayingCount';
import isNotNullOrUndefined from '../../utils/misc/isNotNullOrUndefined';
import { BUTTONS_TUTORIAL } from '../../config/constants';
import { EMOJI_QUIZ, TEXT_TUTORIAL } from '../../config/texts';

// Types
import { Telegraf } from 'telegraf';

const createSendReminder = (bot: Telegraf<any>) => async () => {
  // ! This only works if we have the `pubquizChatId` defined in the ENVs.
  if (!isNotNullOrUndefined(envConfig.pubquizChatId)) {
    return;
  }

  try {
    const sendMessageWithoutContext = createSendMessageWithoutContext(bot);

    const currentQuiz = await getOrCreateCurrentQuizDb();

    const isEmailSent = currentQuiz.isEmailSent;
    const playersOutCount = getPlayersPlayingCount(currentQuiz);
    const playersPlayingCount = getPlayersPlayingCount(currentQuiz);

    if (isEmailSent) {
      return;
    }

    if (playersPlayingCount >= envConfig.maxPlayers) {
      return;
    }

    const chatMembersCount = await bot.telegram?.getChatMembersCount(envConfig.pubquizChatId);
    const notRespondedCount = chatMembersCount - playersPlayingCount - playersOutCount - 1; // We subtract one for the bot itself.;
    const emptySpotsCount = envConfig.maxPlayers - playersPlayingCount;

    const notRespondedMessage =
      notRespondedCount > 0 ? `<b>${notRespondedCount}</b> ${pluralize('player', notRespondedCount)} did not respond yet.\n\n` : '';

    await sendMessageWithoutContext(
      `${EMOJI_QUIZ} We still have <b>${emptySpotsCount}</b> empty ${pluralize(
        'spot',
        emptySpotsCount,
      )}! ${EMOJI_QUIZ}\n\n${notRespondedMessage}${TEXT_TUTORIAL}`,
      {
        ...BUTTONS_TUTORIAL,
      },
    );
  } catch (err) {
    console.error(err);
  }
};

export default createSendReminder;
