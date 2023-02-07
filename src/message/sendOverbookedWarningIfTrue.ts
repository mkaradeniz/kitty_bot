import pluralize from 'pluralize';
import { Markup } from 'telegraf';

import createSendMessage from '../utils/message/createSendMessage';
import envConfig from '../config/env';
import getPlayerCountDb from '../db/getPlayerCount';
import { CALLBACK_TYPE_LOTTERY } from '../config/constants';
import { EMOJI_LOTTERY } from '../config/texts';

// Types
import { MyBotContext } from '../middleware/contextMiddleware';

const sendOverbookedWarningIfTrue = async (ctx: MyBotContext) => {
  const sendMessage = createSendMessage(ctx);

  const playerCount = await getPlayerCountDb();

  if (playerCount <= envConfig.maxPlayers) {
    return;
  }

  await sendMessage(
    `⚠️ We're overbooked! ⚠️
We have to pick <b>${envConfig.maxPlayers}</b> ${pluralize('player', envConfig.maxPlayers)} from everyone who confirmed.
Send a ${EMOJI_LOTTERY} or click the button below to peform the lottery.
Please be sure that everyone who wants to join did register before starting the lottery.`,
    { ...Markup.inlineKeyboard([Markup.button.callback(EMOJI_LOTTERY, CALLBACK_TYPE_LOTTERY)]) },
  );
};

export default sendOverbookedWarningIfTrue;
