import pluralize from 'pluralize';
import { Markup } from 'telegraf';

import createSendMessage from '../utils/message/createSendMessage';
import envConfig from '../config/env';
import getButtonFromCallbackType from '../utils/misc/getButtonFromCallbackType';
import getOrCreateCurrentQuizDb from '../db/getOrCreateCurrentQuiz';
import getPlayersPlayingCount from '../utils/state/getPlayersPlayingCount';
import logger from '../utils/logger';

// Types
import { CallbackType, Emoji } from '../types';
import { MyBotContext } from '../middleware/contextMiddleware';

const sendOverbookedWarningIfTrue = async (ctx: MyBotContext) => {
  const sendMessage = createSendMessage(ctx);

  const currentQuiz = await getOrCreateCurrentQuizDb();
  const playerCount = getPlayersPlayingCount(currentQuiz);

  if (playerCount <= envConfig.maxPlayers) {
    logger.silly(`Overbooked warning not sent because quiz is not overbooked.`, { label: 'src/message/sendOverbookedWarningIfTrue.ts' });

    return;
  }

  try {
    await sendMessage(
      `⚠️ We're overbooked! ⚠️
We have to pick <b>${envConfig.maxPlayers}</b> ${pluralize('player', envConfig.maxPlayers)} from everyone who confirmed.
Send a ${Emoji.Lottery} or click the button below to peform the lottery.
Please be sure that everyone who wants to join did register before starting the lottery.`,
      { ...Markup.inlineKeyboard([Markup.button.callback(getButtonFromCallbackType(CallbackType.Lottery), CallbackType.Lottery)]) },
    );
  } catch (err) {
    logger.error(err);
  }
};

export default sendOverbookedWarningIfTrue;
