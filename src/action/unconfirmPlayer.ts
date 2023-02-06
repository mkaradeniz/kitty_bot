import createCallback from '../utils/misc/createCallback';
import createSendMessage from '../utils/message/createSendMessage';
import getOrCreateCurrentQuizDb from '../db/getOrCreateCurrentQuiz';
import getTelegramIdFromContext from '../utils/context/getTelegramIdFromContext';
import getUsernameFromContext from '../utils/context/getUsernameFromContext';
import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';
import isPlayerOut from '../utils/state/isPlayerOut';
import pickPlayerFromBench from '../utils/state/pickPlayerFromBench';
import sendCurrentPlayerCount from './sendCurrentPlayerCount';
import sendOverbookedWarningIfTrue from './sendOverbookedWarningIfTrue';
import unconfirmPlayerDb from '../db/unconfirmPlayer';
import { EMOJI_PLAYER_OUT, EMOJI_REPEAT, EMOJI_TEAM } from '../config/texts';

// Types
import { MyBotContext } from '../middleware/contextMiddleware';

const createUnconfirmPlayer =
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

      if (isPlayerOut({ currentQuiz, telegramId })) {
        await sendMessage(
          `We get it, ${usernameInBold}, you really don't want to play with us this week. No need to repeat yourself. ${EMOJI_REPEAT}`,
        );

        return callback();
      }

      await unconfirmPlayerDb(telegramId);

      await sendMessage(`${EMOJI_TEAM} ${usernameInBold} is out! ${EMOJI_PLAYER_OUT}`);

      if (currentQuiz._count.playersBenched > 0) {
        await pickPlayerFromBench(ctx);
      }

      await sendCurrentPlayerCount(ctx);

      await sendOverbookedWarningIfTrue(ctx);

      return callback();
    } catch (err) {
      console.error(err);

      return callback();
    }
  };

export default createUnconfirmPlayer;
