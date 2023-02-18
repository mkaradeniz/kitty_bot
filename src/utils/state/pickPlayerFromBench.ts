import confirmPlayerDb from '@db/confirmPlayers';
import createSendGif from '@utils/message/createSendGif';
import createSendMessage from '@utils/message/createSendMessage';
import getOrCreateCurrentQuizDb from '@db/getOrCreateCurrentQuiz';
import getRandomUnbenchedGif from '@utils/gifs/getRandomUnbenchedGif';
import pickPlayersWeighted from '@utils/misc/pickPlayersWeighted';
import { EMOJI_POSITIVE } from '@config/texts';

// Types
import { MyBotContext } from '@middleware/contextMiddleware';

const pickPlayerFromBench = async (ctx: MyBotContext) => {
  const sendGif = createSendGif(ctx);
  const sendMessage = createSendMessage(ctx);

  const currentQuiz = await getOrCreateCurrentQuizDb();

  if (currentQuiz._count.playersBenched === 0) {
    return;
  }

  const [pickedPlayer] = pickPlayersWeighted(currentQuiz.playersBenched, 1);

  await confirmPlayerDb(pickedPlayer.telegramId);

  const sentMessage = await sendMessage(`You're back on the team, <b>${pickedPlayer.firstName}</b> ${EMOJI_POSITIVE}.`);

  await sendGif(getRandomUnbenchedGif(), sentMessage.message_id);
};

export default pickPlayerFromBench;
