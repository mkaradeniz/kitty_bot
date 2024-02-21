import { confirmPlayersDb } from '@db/confirmPlayers';
import { getOrCreateCurrentQuizDb } from '@db/getOrCreateCurrentQuiz';

import { type MyBotContext } from '@middleware/contextMiddleware';

import { getRandomUnbenchedGif } from '@utils/gifs/getRandomUnbenchedGif';
import { createSendGif } from '@utils/message/createSendGif';
import { createSendMessage } from '@utils/message/createSendMessage';
import { pickPlayersWeighted } from '@utils/misc/pickPlayersWeighted';

import { Emoji } from '@app-types/app';

export const pickPlayerFromBench = async (ctx: MyBotContext) => {
  const sendGif = createSendGif(ctx);
  const sendMessage = createSendMessage(ctx);

  const currentQuiz = await getOrCreateCurrentQuizDb();

  if (currentQuiz._count.playersBenched === 0) {
    return;
  }

  const [pickedPlayer] = pickPlayersWeighted(currentQuiz.playersBenched, 1);

  await confirmPlayersDb(pickedPlayer.telegramId);

  const sentMessage = await sendMessage(`You're back on the team, <b>${pickedPlayer.firstName}</b> ${Emoji.Positive}.`);

  await sendGif(getRandomUnbenchedGif(), sentMessage?.message_id);
};
