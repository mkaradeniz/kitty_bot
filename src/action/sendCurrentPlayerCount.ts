import pluralize from 'pluralize';

import createSendMessage from '../utils/message/createSendMessage';
import getOrCreateCurrentQuizDb from '../db/getOrCreateCurrentQuiz';

// Types
import { MyBotContext } from '../middleware/contextMiddleware';

const sendCurrentPlayerCount = async (ctx: MyBotContext) => {
  const sendMessage = createSendMessage(ctx);

  const currentQuiz = await getOrCreateCurrentQuizDb();

  const date = currentQuiz.dateFormatted;
  const playerCount = currentQuiz._count.players;

  await sendMessage(`We have <b>${playerCount}</b> registered ${pluralize('player', playerCount)} for the <b>${date}</B>.`);
};

export default sendCurrentPlayerCount;
