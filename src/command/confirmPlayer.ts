import confirmPlayerDb from '../db/confirmPlayers';
import createCallback from '../utils/misc/createCallback';
import createSendMessage from '../utils/message/createSendMessage';
import getOrCreateCurrentQuizDb from '../db/getOrCreateCurrentQuiz';
import getTelegramIdFromContext from '../utils/context/getTelegramIdFromContext';
import getUsernameFromContext from '../utils/context/getUsernameFromContext';
import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';
import isPlayerBenched from '../utils/state/isPlayerBenched';
import isPlayerPlaying from '../utils/state/isPlayerRegistered';
import sendCurrentPlayerCount from '../message/sendCurrentPlayerCount';
import sendOverbookedWarningIfTrue from '../message/sendOverbookedWarningIfTrue';
import { EMOJI_PLAYER_BENCHED, EMOJI_POSITIVE, EMOJI_REPEAT, EMOJI_TEAM } from '../config/texts';

// Types
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

      if (isPlayerPlaying({ currentQuiz, telegramId })) {
        await sendMessage(`Thanks for letting us know, <i>again</i>, that you want to play this week, ${usernameInBold}. ${EMOJI_REPEAT}`);

        return callback();
      }

      if (isPlayerBenched({ currentQuiz, telegramId })) {
        await sendMessage(`Sorry ${usernameInBold}, you're benched this week. ${EMOJI_PLAYER_BENCHED}`);

        return callback();
      }

      await confirmPlayerDb(telegramId);

      await sendMessage(`${EMOJI_TEAM} ${usernameInBold} is in! ${EMOJI_POSITIVE}`);

      await sendCurrentPlayerCount(ctx);

      await sendOverbookedWarningIfTrue(ctx);

      return callback();
    } catch (err) {
      console.error(err);

      return callback();
    }
  };

export default createConfirmPlayer;
