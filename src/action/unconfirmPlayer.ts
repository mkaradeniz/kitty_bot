import pluralize from 'pluralize';
import { Markup } from 'telegraf';
import { getISODay } from 'date-fns';

import createSendLineup from './sendLineup';
import envConfig from '../config/env';
import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';
import { CALLBACK_TYPE_LOTTERY } from '../config/constants';
import { CONFIRM_EMOJI, LINEUP_COMPLETE, LOTTERY_EMOJI, OVERBOOKED, PLAYER_OUT_EMOJI } from '../config/texts';
import {
  addPlayer,
  getPlayerBenchedCount,
  getPlayerCount,
  getPlayersBenched,
  getQuizDate,
  isUserBenched,
  isUserOutAlready,
  removePlayer,
  setPlayersBenched,
} from '../middleware/stateMiddleware';

// Types
import { DayOfWeek } from '../types';
import { KittyBotContext } from '../middleware/contextMiddleware';
import getUsersWithCountBenched from '../db/getUsersWithCountBenched';
import getWeightedSample from '../utils/misc/getWeightedSample';
import { differenceBy } from 'lodash';
import getRandomUnbenchedGif from '../utils/misc/getRandomUnbenchedGif';
import playerBenchCountDecrement from '../db/playerBenchCountDecrement';

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

  if (isUserBenched({ chatId, userId })) {
    const benchedPlayers = getPlayersBenched(chatId);
    const nextPlayersBenched = benchedPlayers.filter(player => player.id !== userId);

    setPlayersBenched({ chatId, nextPlayersBenched });
  }

  removePlayer(chatId, user);

  await ctx.telegram.sendMessage(chatId, `🥒🐭 <b>${user.first_name}</b> is out! ${PLAYER_OUT_EMOJI}`, { parse_mode: 'HTML' });

  if (getPlayerBenchedCount(chatId) > 0) {
    const benchedPlayers = getPlayersBenched(chatId);

    const playersWithCountBenched = await getUsersWithCountBenched(benchedPlayers);

    const [pickedPlayer] = getWeightedSample(playersWithCountBenched, 1);
    const nextPlayersBenched = differenceBy(playersWithCountBenched, [pickedPlayer], player => player.id);

    addPlayer(chatId, pickedPlayer);
    setPlayersBenched({ chatId, nextPlayersBenched });
    await playerBenchCountDecrement(pickedPlayer);

    const message = await ctx.telegram.sendMessage(
      chatId,
      `You're back on on the team, <b>${pickedPlayer.first_name}</b> ${CONFIRM_EMOJI}}.`,
      { parse_mode: 'HTML' },
    );

    await ctx.telegram.sendAnimation(chatId, getRandomUnbenchedGif(), { reply_to_message_id: message.message_id });
  }

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
};

export default createUnconfirmPlayer;
