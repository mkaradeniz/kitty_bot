import { Markup } from 'telegraf';

import { getOrCreateCurrentQuizDb } from '@db/getOrCreateCurrentQuiz';

import { sendOverbookedWarningIfTrue } from '@message/sendOverbookedWarningIfTrue';
import { type MyBotContext } from '@middleware/contextMiddleware';

import { logger } from '@utils/logger/logger';
import { createSendMessage } from '@utils/message/createSendMessage';
import { createCallback } from '@utils/misc/createCallback';
import { getButtonFromCallbackType } from '@utils/misc/getButtonFromCallbackType';
import { getLineup } from '@utils/state/getLineup';
import { getPlayersBenchedCount } from '@utils/state/getPlayersBenchedCount';
import { getPlayersOutCount } from '@utils/state/getPlayersOutCount';
import { getPlayersPlayingCount } from '@utils/state/getPlayersPlayingCount';

import { CallbackType } from '@app-types/app';

export const createSendLineup =
  (isCallback = false) =>
  async (ctx: MyBotContext) => {
    const callback = createCallback({ ctx, isCallback });

    try {
      const sendMessage = createSendMessage(ctx);

      const currentQuiz = await getOrCreateCurrentQuizDb();

      const playersPlayingCount = getPlayersPlayingCount(currentQuiz);
      const playersOutCount = getPlayersOutCount(currentQuiz);
      const playersBenchedCount = getPlayersBenchedCount(currentQuiz);

      if (playersPlayingCount + playersOutCount + playersBenchedCount === 0) {
        await sendMessage(`We have no confirmed players for the <b>${currentQuiz.dateFormatted}</b> at the moment.`);

        return callback();
      }

      const lineup = getLineup(currentQuiz);

      const benchCtaButton =
        playersBenchedCount > 0
          ? {
              ...Markup.inlineKeyboard([
                Markup.button.callback(getButtonFromCallbackType(CallbackType.Confirm), CallbackType.Confirm),
                Markup.button.callback(getButtonFromCallbackType(CallbackType.Unconfirm), CallbackType.Unconfirm),
                Markup.button.callback(getButtonFromCallbackType(CallbackType.Bench), CallbackType.Bench),
              ]),
            }
          : {};

      await sendMessage(lineup, { ...benchCtaButton });

      await sendOverbookedWarningIfTrue(ctx);

      return callback();
    } catch (err) {
      logger.error(err);

      return callback();
    }
  };
