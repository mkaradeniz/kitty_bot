import benchPlayersDb from '../db/benchPlayers';
import confirmPlayerDb from '../db/confirmPlayers';
import createCallback from '../utils/misc/createCallback';
import createSendMessage from '../utils/message/createSendMessage';
import envConfig from '../config/env';
import getOrCreateCurrentQuizDb from '../db/getOrCreateCurrentQuiz';
import getPlayersPlayingCount from '../utils/state/getPlayersPlayingCount';
import getTelegramIdFromContext from '../utils/context/getTelegramIdFromContext';
import getUsernameFromContext from '../utils/context/getUsernameFromContext';
import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';
import isPlayerBenched from '../utils/state/isPlayerBenched';
import isPlayerPlaying from '../utils/state/isPlayerRegistered';
import logger from '../utils/logger';
import sendCurrentPlayerCount from '../message/sendCurrentPlayerCount';
import sendLineupCompleteMessageIfTrue from '../message/sendLineupCompleteMessageIfTrue';
import sendOverbookedWarningIfTrue from '../message/sendOverbookedWarningIfTrue';

// Types
import { Emoji } from '../types';
import { MyBotContext } from '../middleware/contextMiddleware';

const createConfirmPlayer =
  (isCallback = false) =>
  async (ctx: MyBotContext) => {
    const callback = createCallback({ ctx, isCallback });

    try {
      const sendMessage = createSendMessage(ctx);

      const telegramId = getTelegramIdFromContext(ctx);
      const { usernameInBold } = getUsernameFromContext(ctx);

      if (!isNotNullOrUndefined(telegramId)) {
        return callback();
      }

      const currentQuiz = await getOrCreateCurrentQuizDb();

      const playersPlayingCount = getPlayersPlayingCount(currentQuiz);

      if (currentQuiz.isLotteryDone && playersPlayingCount === envConfig.maxPlayers) {
        await benchPlayersDb(telegramId);

        await sendMessage(`${usernameInBold} went straight to the bench. ${Emoji.PlayerBenched}`);

        return callback();
      }

      if (isPlayerPlaying({ currentQuiz, telegramId })) {
        await sendMessage(`Thanks for letting us know, <i>again</i>, that you want to play this week, ${usernameInBold}. ${Emoji.Repeat}`);

        return callback();
      }

      if (isPlayerBenched({ currentQuiz, telegramId })) {
        await sendMessage(`Sorry ${usernameInBold}, you're benched this week. ${Emoji.PlayerBenched}`);

        return callback();
      }

      await confirmPlayerDb(telegramId);

      await sendMessage(`${Emoji.Team} ${usernameInBold} is in! ${Emoji.Positive}`);

      await sendCurrentPlayerCount(ctx);

      await sendLineupCompleteMessageIfTrue(ctx);
      await sendOverbookedWarningIfTrue(ctx);

      return callback();
    } catch (err) {
      logger.error(err);

      return callback();
    }
  };

export default createConfirmPlayer;
