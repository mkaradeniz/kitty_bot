import { differenceBy } from 'lodash';

import benchPlayersDb from '../db/benchPlayers';
import confirmPlayersDb from '../db/confirmPlayers';
import createCallback from '../utils/misc/createCallback';
import createSendGif from '../utils/message/createSendGif';
import createSendLineup from './sendLineup';
import createSendMessage from '../utils/message/createSendMessage';
import getOrCreateCurrentQuizDb from '../db/getOrCreateCurrentQuiz';
import getPlayersBenchedCount from '../utils/state/getPlayersBenchedCount';
import getRandomUnbenchedGif from '../utils/gifs/getRandomUnbenchedGif';
import getTelegramIdFromContext from '../utils/context/getTelegramIdFromContext';
import getUsernameFromContext from '../utils/context/getUsernameFromContext';
import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';
import isPlayerBenched from '../utils/state/isPlayerBenched';
import isPlayerOut from '../utils/state/isPlayerOut';
import logger from '../utils/logger';
import pickPlayersWeighted from '../utils/misc/pickPlayersWeighted';
import { EMOJI_PLAYER_BENCHED, EMOJI_POSITIVE, EMOJI_DECLINE, EMOJI_REPEAT } from '../config/texts';

// Types
import { MyBotContext } from '../middleware/contextMiddleware';

const createBenchPlayer =
  (isCallback = false) =>
  async (ctx: MyBotContext) => {
    const callback = createCallback({ ctx, isCallback });

    try {
      const sendGif = createSendGif(ctx);
      const sendMessage = createSendMessage(ctx);

      const currentQuiz = await getOrCreateCurrentQuizDb();
      const { usernameInBold } = getUsernameFromContext(ctx);

      const telegramId = getTelegramIdFromContext(ctx);

      if (!isNotNullOrUndefined(telegramId)) {
        return callback();
      }

      if (isPlayerOut({ currentQuiz, telegramId })) {
        await sendMessage(
          `You can't bench yourself, ${usernameInBold}, if you're were never going to participate in the first place. ${EMOJI_REPEAT}`,
        );

        return callback();
      }

      const playersBenchedCount = getPlayersBenchedCount(currentQuiz);

      if (playersBenchedCount === 0) {
        await sendMessage(
          `${usernameInBold}, you can't bench yourself if we don't have anyone on the bench waiting. If you want to cancel your registration, type ${EMOJI_DECLINE}.`,
        );

        return callback();
      }

      if (isPlayerBenched({ currentQuiz, telegramId })) {
        await sendMessage(`${usernameInBold}, you can't be benched more than you are benched already.`);

        return callback();
      }

      const benchedPlayers = currentQuiz.playersBenched;

      const [pickedPlayer] = pickPlayersWeighted(benchedPlayers, 1);
      const nextPlayersBenched = differenceBy(benchedPlayers, [pickedPlayer], player => player.id);

      await confirmPlayersDb(pickedPlayer.telegramId);
      await benchPlayersDb(nextPlayersBenched.map(pickedPlayer => pickedPlayer.telegramId));

      const sentMessage = await sendMessage(`You're back on the team, <b>${pickedPlayer.firstName}</b> ${EMOJI_POSITIVE}.`);

      await sendGif(getRandomUnbenchedGif(), sentMessage.message_id);

      await benchPlayersDb(telegramId);

      await sendMessage(`${EMOJI_PLAYER_BENCHED} ${usernameInBold} sacrifices themselves selflessly to the bench!`);

      await createSendLineup(isCallback)(ctx);

      return callback();
    } catch (err) {
      logger.error(err);

      return callback();
    }
  };

export default createBenchPlayer;
