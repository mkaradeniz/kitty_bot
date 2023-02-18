import confirmPlayerDb from '../../db/confirmPlayers';
import createSendGif from '../message/createSendGif';
import createSendMessage from '../message/createSendMessage';
import getOrCreateCurrentQuizDb from '../../db/getOrCreateCurrentQuiz';
import getRandomUnbenchedGif from '../gifs/getRandomUnbenchedGif';
import pickPlayersWeighted from '../misc/pickPlayersWeighted';

// Types
import { Emoji } from '../../types';
import { MyBotContext } from '../../middleware/contextMiddleware';

const pickPlayerFromBench = async (ctx: MyBotContext) => {
  const sendGif = createSendGif(ctx);
  const sendMessage = createSendMessage(ctx);

  const currentQuiz = await getOrCreateCurrentQuizDb();

  if (currentQuiz._count.playersBenched === 0) {
    return;
  }

  const [pickedPlayer] = pickPlayersWeighted(currentQuiz.playersBenched, 1);

  await confirmPlayerDb(pickedPlayer.telegramId);

  const sentMessage = await sendMessage(`You're back on the team, <b>${pickedPlayer.firstName}</b> ${Emoji.Positive}.`);

  await sendGif(getRandomUnbenchedGif(), sentMessage.message_id);
};

export default pickPlayerFromBench;
