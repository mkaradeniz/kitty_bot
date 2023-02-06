import pluralize from 'pluralize';
import { Markup } from 'telegraf';
import { differenceBy } from 'lodash';
import { getISODay } from 'date-fns';

import createCallback from '../utils/misc/createCallback';
import createSendLineup from './sendLineup';
import envConfig from '../config/env';
import getRandomUnbenchedGif from '../utils/gifs/getRandomUnbenchedGif';
import getUsersWithCountBenched from '../db/getUsersWithCountBenched';
import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';
import pickPlayersWeighted from '../utils/misc/pickPlayersWeighted';
import playerBenchCountDecrement from '../db/playerBenchCountDecrement';
import { CALLBACK_TYPE_LOTTERY } from '../config/constants';
import { LINEUP_COMPLETE, LOTTERY_EMOJI, OVERBOOKED, PLAYER_BENCHED_EMOJI, POSITIVE_EMOJI } from '../config/texts';
import {
  addPlayer,
  benchPlayer,
  getPlayerBenchedCount,
  getPlayerCount,
  getPlayersBenched,
  getQuizDate,
  isUserBenched,
  isUserOutAlready,
  setPlayersBenched,
} from '../middleware/stateMiddleware';

// Types
import { DayOfWeek } from '../types';
import { KittyBotContext } from '../middleware/contextMiddleware';

const createBenchPlayer = (isCallback = false) => async (ctx: KittyBotContext) => {
  const callback = createCallback({ ctx, isCallback });

  try {
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

    const playerBenchedCount = getPlayerBenchedCount(chatId);

    if (playerBenchedCount === 0) {
      await ctx.telegram.sendMessage(
        chatId,
        `<b>${user.first_name}</b>, you can't bench yourself if we don't have anyone on the bench waiting.`,
        { parse_mode: 'HTML' },
      );

      return callback();
    }

    if (isUserBenched({ chatId, userId })) {
      await ctx.telegram.sendMessage(chatId, `<b>${user.first_name}</b>, you can't be benched more than you are benched already.`, {
        parse_mode: 'HTML',
      });

      return callback();
    }

    // Pick one of the benched players.
    const benchedPlayers = getPlayersBenched(chatId);

    const playersWithCountBenched = await getUsersWithCountBenched(benchedPlayers);

    const [pickedPlayer] = pickPlayersWeighted(playersWithCountBenched, 1);
    const nextPlayersBenched = differenceBy(playersWithCountBenched, [pickedPlayer], player => player.id);

    addPlayer(chatId, pickedPlayer);
    setPlayersBenched({ chatId, nextPlayersBenched });
    await playerBenchCountDecrement(pickedPlayer);

    const message = await ctx.telegram.sendMessage(
      chatId,
      `You're back on the team, <b>${pickedPlayer.first_name}</b> ${POSITIVE_EMOJI}.`,
      { parse_mode: 'HTML' },
    );

    await ctx.telegram.sendAnimation(chatId, getRandomUnbenchedGif(), { reply_to_message_id: message.message_id });

    // Bench player
    benchPlayer(chatId, user);

    await ctx.telegram.sendMessage(
      chatId,
      `${PLAYER_BENCHED_EMOJI} <b>${user.first_name}</b> takes one for the team and benches themselves!`,
      { parse_mode: 'HTML' },
    );

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

export default createBenchPlayer;
