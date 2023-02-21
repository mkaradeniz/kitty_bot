import pluralize from 'pluralize';

import createSendEmailReminder from './sendEmailReminder';
import createSendMessageWithoutContext from '../utils/message/createSendMessageWithoutContext';
import envConfig from '../config/env';
import getOrCreateCurrentQuizDb from '../db/getOrCreateCurrentQuiz';
import getPlayersPlayingCount from '../utils/state/getPlayersPlayingCount';
import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';
import logger from '../utils/logger';
import { BUTTONS_TUTORIAL } from '../config/constants';
import { TEXT_TUTORIAL } from '../config/texts';

// Types
import { Emoji } from '../types';
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

    if (playersPlayingCount === envConfig.maxPlayers) {
      await createSendEmailReminder(bot)();

      return;
    }

    const chatMembersCount = await bot.telegram?.getChatMembersCount(envConfig.pubquizChatId);
    const notRespondedCount = chatMembersCount - playersPlayingCount - playersOutCount - 1; // We subtract one for the bot itself.;
    const emptySpotsCount = envConfig.maxPlayers - playersPlayingCount;

    const notRespondedMessage =
      notRespondedCount > 0 ? `<b>${notRespondedCount}</b> ${pluralize('player', notRespondedCount)} did not respond yet.\n\n` : '';

    await sendMessageWithoutContext(
      `${Emoji.Quiz} We still have <b>${emptySpotsCount}</b> empty ${pluralize('spot', emptySpotsCount)}! ${
        Emoji.Quiz
      }\n\n${notRespondedMessage}${TEXT_TUTORIAL}`,
      {
        ...BUTTONS_TUTORIAL,
      },
    );

    logger.silly(`Reminder sent.`, { label: 'src/message/sendReminder.ts' });
  } catch (err) {
    logger.error(err);
  }
};

export default createSendReminder;
