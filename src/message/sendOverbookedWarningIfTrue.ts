import pluralize from 'pluralize';
import { Markup } from 'telegraf';

import { envConfig } from '@config/env';

import { getOrCreateCurrentQuizDb } from '@db/getOrCreateCurrentQuiz';

import { type MyBotContext } from '@middleware/contextMiddleware';

import { logger } from '@utils/logger/logger';
import { createSendMessage } from '@utils/message/createSendMessage';
import { getButtonFromCallbackType } from '@utils/misc/getButtonFromCallbackType';
import { getPlayersPlayingCount } from '@utils/state/getPlayersPlayingCount';

import { CallbackType, Emoji } from '@app-types/app';

export const sendOverbookedWarningIfTrue = async (ctx: MyBotContext) => {
  const sendMessage = createSendMessage(ctx);

  const currentQuiz = await getOrCreateCurrentQuizDb();
  const playerCount = getPlayersPlayingCount(currentQuiz);

  if (playerCount <= envConfig.maxPlayers) {
    logger.silly(`Overbooked warning not sent because quiz is not overbooked.`, { label: 'src/message/sendOverbookedWarningIfTrue.ts:22' });

    return;
  }

  try {
    await sendMessage(`⚠️ We're overbooked! ⚠️`);

    if (!currentQuiz.isLotteryDone) {
      await sendMessage(
        `We have to pick <b>${envConfig.maxPlayers}</b> ${pluralize('player', envConfig.maxPlayers)} from everyone who confirmed.
Send a ${Emoji.Lottery} or click the button below to peform the lottery.
Please be sure that everyone who wants to join did register before starting the lottery.`,
        { ...Markup.inlineKeyboard([Markup.button.callback(getButtonFromCallbackType(CallbackType.Lottery), CallbackType.Lottery)]) },
      );
    }
  } catch (err) {
    logger.error(err);
  }
};
