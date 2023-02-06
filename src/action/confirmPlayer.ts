import pluralize from 'pluralize';
import { Markup } from 'telegraf';
import { getISODay } from 'date-fns';

import createCallback from '../utils/misc/createCallback';
import createSendLineup from './sendLineup';
import envConfig from '../config/env';
import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';
import { CALLBACK_TYPE_LOTTERY } from '../config/constants';
import { LINEUP_COMPLETE, LOTTERY_EMOJI, OVERBOOKED, PLAYER_BENCHED_EMOJI, POSITIVE_EMOJI, TEAM_EMOJI } from '../config/texts';
import { addPlayer, getPlayerCount, getQuizDate, isUserBenched, isUserPlayingAlready } from '../middleware/stateMiddleware';

// Types
import { DayOfWeek } from '../types';
import { KittyBotContext } from '../middleware/contextMiddleware';

const createConfirmPlayer = (isCallback = false) => async (ctx: KittyBotContext) => {
  const callback = createCallback({ ctx, isCallback });

  try {
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

    if (isUserBenched({ chatId, userId })) {
      await ctx.telegram.sendMessage(chatId, `Sorry <b>${user.first_name}</b>, you're benched this week. ${PLAYER_BENCHED_EMOJI}`, {
        parse_mode: 'HTML',
      });

      return callback();
    }

    addPlayer(chatId, user);

    await ctx.telegram.sendMessage(chatId, `${TEAM_EMOJI} <b>${user.first_name}</b> is in! ${POSITIVE_EMOJI}`, { parse_mode: 'HTML' });

    const playerCount = getPlayerCount(chatId);

    if (playerCount < envConfig.maxPlayers) {
      await ctx.telegram.sendMessage(
        chatId,
        `We have <b>${playerCount}</b> confirmed ${pluralize('player', playerCount)} for the <b>${quizDate}</B>.`,
        { parse_mode: 'HTML' },
      );

      return callback();
    }

    if (playerCount === envConfig.maxPlayers) {
      await ctx.telegram.sendMessage(chatId, LINEUP_COMPLETE);

      await createSendLineup(isCallback)(ctx);

      return callback();
    }

    if (playerCount > envConfig.maxPlayers) {
      await createSendLineup(isCallback)(ctx);

      await ctx.telegram.sendMessage(chatId, OVERBOOKED, {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([Markup.button.callback(LOTTERY_EMOJI, CALLBACK_TYPE_LOTTERY)]),
      });
    }

    return callback();
  } catch (err) {
    console.error(err);

    return callback();
  }
};

export default createConfirmPlayer;
