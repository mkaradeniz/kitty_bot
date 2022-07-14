import { getISODay } from 'date-fns';

import envConfig from '../config/env';
import { getLineup, getPlayerCount, getPlayerOutCount, getPlayerBenchedCount, getQuizDate } from '../middleware/stateMiddleware';

// Types
import { DayOfWeek } from '../types';
import { KittyBotContext } from '../middleware/contextMiddleware';

const createSendLineup = (isCallback: boolean = false) => async (ctx: KittyBotContext) => {
  const callback = () => {
    if (isCallback) {
      ctx.answerCbQuery('');
    }
  };

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

  await ctx.telegram.sendMessage(chatId, lineup, { parse_mode: 'HTML' });

  return callback();
};

export default createSendLineup;
