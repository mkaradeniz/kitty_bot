import pluralize from 'pluralize';

import { getOrCreateCurrentQuizDb } from '@db/getOrCreateCurrentQuiz';

import { type MyBotContext } from '@middleware/contextMiddleware';

import { logger } from '@utils/logger/logger';
import { createSendMessage } from '@utils/message/createSendMessage';
import { getPlayersPlayingCount } from '@utils/state/getPlayersPlayingCount';

export const sendCurrentPlayerCount = async (ctx: MyBotContext) => {
  const sendMessage = createSendMessage(ctx);

  const currentQuiz = await getOrCreateCurrentQuizDb();

  const date = currentQuiz.dateFormatted;
  const playerCount = getPlayersPlayingCount(currentQuiz);

  try {
    await sendMessage(`We have <b>${playerCount}</b> registered ${pluralize('player', playerCount)} for the <b>${date}</B>.`);
  } catch (err) {
    logger.error(err);
  }
};
