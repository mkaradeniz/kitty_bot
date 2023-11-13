import pluralize from 'pluralize';

import createSendMessage from '../utils/message/createSendMessage';
import getOrCreateCurrentQuizDb from '../db/getOrCreateCurrentQuiz';
import logger from '../utils/logger';

// Types
import { MyBotContext } from '../middleware/contextMiddleware';
import getPlayersPlayingCount from '../utils/state/getPlayersPlayingCount';

const sendCurrentPlayerCount = async (ctx: MyBotContext) => {
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

export default sendCurrentPlayerCount;
