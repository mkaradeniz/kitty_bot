import pluralize from 'pluralize';
import { getISODay } from 'date-fns';

import envConfig from '../config/env';
import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';
import { LINEUP_COMPLETE, OVERBOOKED } from '../config/texts';
import { addPlayer, getLineup, getPlayerCount, getQuizDate, isUserPlayingAlready } from '../middleware/stateMiddleware';

// Types
import { DayOfWeek } from '../types';
import { KittyBotContext } from '../middleware/contextMiddleware';

const createConfirmPlayer = (isCallback: boolean = false) => async (ctx: KittyBotContext) => {
  const callback = () => {
    if (isCallback) {
      ctx.answerCbQuery('');
    }
  };

  const dayOfWeek = getISODay(new Date());

  if (envConfig.isProduction && dayOfWeek !== DayOfWeek.Sunday && dayOfWeek !== DayOfWeek.Monday && dayOfWeek !== DayOfWeek.Tuesday) {
    return callback();
  }

  const { chatId, user } = ctx.myContext;

  const quizDate = getQuizDate(chatId);
  const userId = ctx.myContext.user?.id;

  if (!isNotNullOrUndefined(user) || !isNotNullOrUndefined(userId)) {
    return callback();
  }

  // User is already playing in this week's quiz.
  if (isUserPlayingAlready(chatId, userId)) {
    return callback();
  }

  addPlayer(chatId, user);

  await ctx.telegram.sendMessage(chatId, `🥒🐭 <b>${user.first_name}</b> is in! 🍺`, { parse_mode: 'HTML' });

  const playerCount = getPlayerCount(chatId);

  if (playerCount < 8) {
    await ctx.telegram.sendMessage(
      chatId,
      `We have <b>${playerCount}</b> confirmed ${pluralize('player', playerCount)} for the <b>${quizDate}</B>.`,
      { parse_mode: 'HTML' },
    );
  }

  if (playerCount >= envConfig.maxPlayers) {
    await ctx.telegram.sendMessage(chatId, LINEUP_COMPLETE);

    const lineup = getLineup(chatId);

    await ctx.telegram.sendMessage(chatId, `Our lineup for the <b>${quizDate}</B>: ${lineup}.`, { parse_mode: 'HTML' });
  }

  if (playerCount > envConfig.maxPlayers) {
    await ctx.telegram.sendMessage(chatId, OVERBOOKED);
  }

  return callback();
};

export default createConfirmPlayer;
