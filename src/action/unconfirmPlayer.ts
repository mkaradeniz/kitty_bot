import pluralize from 'pluralize';
import { getISODay } from 'date-fns';

import envConfig from '../config/env';
import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';
import { MAX_PLAYERS } from '../config/constants';
import { OVERBOOKED } from '../config/texts';
import { getPlayerCount, getQuizDate, isUserOutAlready, removePlayer } from '../middleware/stateMiddleware';

// Types
import { DayOfWeek } from '../types';
import { KittyBotContext } from '../middleware/contextMiddleware';

const createUnconfirmPlayer = (isCallback: boolean = false) => async (ctx: KittyBotContext) => {
  const callback = () => {
    if (isCallback) {
      ctx.answerCbQuery('');
    }
  };

  const dayOfWeek = getISODay(new Date());

  if (
    envConfig.isProduction &&
    dayOfWeek !== DayOfWeek.Sunday &&
    dayOfWeek !== DayOfWeek.Monday &&
    dayOfWeek !== DayOfWeek.Tuesday &&
    dayOfWeek !== DayOfWeek.Wednesday
  ) {
    return callback();
  }

  const { chatId, user } = ctx.myContext;

  const quizDate = getQuizDate(chatId);
  const userId = ctx.myContext.user?.id;

  if (!isNotNullOrUndefined(user) || !isNotNullOrUndefined(userId)) {
    return callback();
  }

  // User is already playing in this week's quiz.
  if (isUserOutAlready(chatId, userId)) {
    return callback();
  }

  removePlayer(chatId, user);

  await ctx.telegram.sendMessage(chatId, `🥒🐭 <b>${user.first_name}</b> is out! 🧂`, { parse_mode: 'HTML' });

  const playerCount = getPlayerCount(chatId);

  if (playerCount < 8) {
    await ctx.telegram.sendMessage(
      chatId,
      `We have <b>${playerCount}</b> confirmed ${pluralize('player', playerCount)} for the <b>${quizDate}</B>.`,
      { parse_mode: 'HTML' },
    );
  }

  if (playerCount > MAX_PLAYERS) {
    await ctx.telegram.sendMessage(chatId, OVERBOOKED);
  }

  return callback();
};

export default createUnconfirmPlayer;
