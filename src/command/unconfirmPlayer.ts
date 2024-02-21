import { getOrCreateCurrentQuizDb } from '@db/getOrCreateCurrentQuiz';
import { unconfirmPlayerDb } from '@db/unconfirmPlayer';

import { sendCurrentPlayerCount } from '@message/sendCurrentPlayerCount';
import { sendOverbookedWarningIfTrue } from '@message/sendOverbookedWarningIfTrue';
import { type MyBotContext } from '@middleware/contextMiddleware';

import { getTelegramIdFromContext } from '@utils/context/getTelegramIdFromContext';
import { getUsernameFromContext } from '@utils/context/getUsernameFromContext';
import { logger } from '@utils/logger/logger';
import { createSendMessage } from '@utils/message/createSendMessage';
import { createCallback } from '@utils/misc/createCallback';
import { isNotNullOrUndefined } from '@utils/misc/isNotNullOrUndefined';
import { isPlayerOut } from '@utils/state/isPlayerOut';
import { isPlayerRegistered } from '@utils/state/isPlayerRegistered';
import { pickPlayerFromBench } from '@utils/state/pickPlayerFromBench';

import { Emoji } from '@app-types/app';

export const createUnconfirmPlayer =
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
          `We get it, ${usernameInBold}, you really don't want to play with us this week. No need to repeat yourself. ${Emoji.Repeat}`,
        );

        return callback();
      }

      const wasPlayerRegisteredBefore = isPlayerRegistered({ currentQuiz, telegramId });

      await unconfirmPlayerDb(telegramId);

      await sendMessage(`${Emoji.Team} ${usernameInBold} is out! ${Emoji.PlayerOut}`);

      if (wasPlayerRegisteredBefore && currentQuiz._count.playersBenched > 0) {
        await pickPlayerFromBench(ctx);
      }

      await sendCurrentPlayerCount(ctx);

      await sendOverbookedWarningIfTrue(ctx);

      return callback();
    } catch (err) {
      logger.error(err);

      return callback();
    }
  };
