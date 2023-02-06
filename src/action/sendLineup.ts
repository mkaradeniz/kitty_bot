import { Markup } from 'telegraf';
import { getISODay } from 'date-fns';

import createCallback from '../utils/misc/createCallback';
import envConfig from '../config/env';
import { getLineup, getPlayerCount, getPlayerOutCount, getPlayerBenchedCount, getQuizDate } from '../middleware/stateMiddleware';

// Types
import { DayOfWeek } from '../types';
import { KittyBotContext } from '../middleware/contextMiddleware';
import { PLAYER_BENCHED_EMOJI } from '../config/texts';
import { CALLBACK_TYPE_BENCH } from '../config/constants';

const createSendLineup = (isCallback = false) => async (ctx: KittyBotContext) => {
  const callback = createCallback({ ctx, isCallback });

  try {
    const { chatId } = ctx.myContext;

    const dayOfWeek = getISODay(new Date());

    if (
      envConfig.isProduction &&
      dayOfWeek !== DayOfWeek.Sunday &&
      dayOfWeek !== DayOfWeek.Monday &&
      dayOfWeek !== DayOfWeek.Tuesday &&
      dayOfWeek !== DayOfWeek.Wednesday
    ) {
      await ctx.telegram.sendMessage(chatId, `We start forming the lineup for next week on Sunday.`);

      return callback();
    }

    const playerCount = getPlayerCount(chatId);
    const playerOutCount = getPlayerOutCount(chatId);
    const playerBenchedCount = getPlayerBenchedCount(chatId);
    const quizDate = getQuizDate(chatId);

    if (playerCount + playerOutCount + playerBenchedCount === 0) {
      await ctx.telegram.sendMessage(chatId, `We have no confirmed players for the <b>${quizDate}</B> at the moment.`, {
        parse_mode: 'HTML',
      });

      return callback();
    }

    const lineup = getLineup(chatId);

    const benchCtaButton =
      playerBenchedCount > 0 ? { ...Markup.inlineKeyboard([Markup.button.callback(PLAYER_BENCHED_EMOJI, CALLBACK_TYPE_BENCH)]) } : {};

    await ctx.telegram.sendMessage(chatId, lineup, {
      parse_mode: 'HTML',
      ...benchCtaButton,
    });

    return callback();
  } catch (err) {
    console.error(err);

    return callback();
  }
};

export default createSendLineup;
