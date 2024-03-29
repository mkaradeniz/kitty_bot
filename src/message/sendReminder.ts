import pluralize from 'pluralize';
import { type Telegraf } from 'telegraf';

import { BUTTONS_TUTORIAL } from '@config/constants';
import { envConfig } from '@config/env';
import { TEXT_TUTORIAL } from '@config/texts';

import { getOrCreateCurrentQuizDb } from '@db/getOrCreateCurrentQuiz';

import { logger } from '@utils/logger/logger';
import { createSendMessageWithoutContext } from '@utils/message/createSendMessageWithoutContext';
import { isNotNullOrUndefined } from '@utils/misc/isNotNullOrUndefined';
import { getPlayersOutCount } from '@utils/state/getPlayersOutCount';
import { getPlayersPlayingCount } from '@utils/state/getPlayersPlayingCount';

import { Emoji } from '@app-types/app';

import { createSendEmailReminder } from './sendEmailReminder';

export const createSendReminder = (bot: Telegraf<any>) => async () => {
  // ! This only works if we have the `pubquizChatId` defined in the ENVs.
  if (!isNotNullOrUndefined(envConfig.pubquizChatId)) {
    return;
  }

  try {
    const sendMessageWithoutContext = createSendMessageWithoutContext(bot);

    const currentQuiz = await getOrCreateCurrentQuizDb();

    const isEmailSent = currentQuiz.isEmailSent;
    const playersOutCount = getPlayersOutCount(currentQuiz);
    const playersPlayingCount = getPlayersPlayingCount(currentQuiz);

    if (isEmailSent) {
      logger.silly(`Reminder not sent because email is already sent.`, { label: 'src/message/sendReminder.ts:34' });

      return;
    }

    if (playersPlayingCount > envConfig.maxPlayers) {
      logger.silly(`Reminder not sent because players playing count is higher than max players.`, {
        label: 'src/message/sendReminder.ts:41',
      });

      return;
    }

    if (playersPlayingCount === envConfig.maxPlayers) {
      await createSendEmailReminder(bot)();

      logger.silly(`Email reminder sent instead of reminder, because of completed lineup.`, { label: 'src/message/sendReminder.ts:50' });

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

    logger.silly(`Reminder sent.`, { label: 'src/message/sendReminder.ts:71' });
  } catch (err) {
    logger.error(err);
  }
};
