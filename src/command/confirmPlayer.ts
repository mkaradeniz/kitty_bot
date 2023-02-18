import confirmPlayerDb from '@db/confirmPlayers';
import createCallback from '@utils/misc/createCallback';
import createSendMessage from '@utils/message/createSendMessage';
import getOrCreateCurrentQuizDb from '@db/getOrCreateCurrentQuiz';
import getTelegramIdFromContext from '@utils/context/getTelegramIdFromContext';
import getUsernameFromContext from '@utils/context/getUsernameFromContext';
import isNotNullOrUndefined from '@utils/misc/isNotNullOrUndefined';
import isPlayerBenched from '@utils/state/isPlayerBenched';
import isPlayerPlaying from '@utils/state/isPlayerRegistered';
import logger from '@utils/logger';
import sendCurrentPlayerCount from '@message/sendCurrentPlayerCount';
import sendOverbookedWarningIfTrue from '@message/sendOverbookedWarningIfTrue';

// Types
import { Emoji } from '@types';
import { MyBotContext } from '@middleware/contextMiddleware';

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

      await sendOverbookedWarningIfTrue(ctx);

      return callback();
    } catch (err) {
      logger.error(err);

      return callback();
    }
  };

export default createConfirmPlayer;
