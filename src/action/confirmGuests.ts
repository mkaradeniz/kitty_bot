import pluralize from 'pluralize';
import { Markup } from 'telegraf';
import { getISODay } from 'date-fns';

import createSendLineup from './sendLineup';
import envConfig from '../config/env';
import getNumberOfInviteesFromEmoji from '../utils/state/getNumberOfInviteesFromEmoji';
import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';
import { CALLBACK_TYPE_LOTTERY } from '../config/constants';
import { LINEUP_COMPLETE, LOTTERY_EMOJI, OVERBOOKED, PLAYER_OUT_EMOJI } from '../config/texts';
import { addPlayersExternal, getPlayerCount, getQuizDate, playerHasInvitations } from '../middleware/stateMiddleware';

// Types
import { DayOfWeek } from '../types';
import { KittyBotContext } from '../middleware/contextMiddleware';

const createConfirmGuests = (isCallback: boolean = false) => async (ctx: KittyBotContext) => {
  const callback = () => {
    if (isCallback) {
      ctx.answerCbQuery('');
    }
  };

  const dayOfWeek = getISODay(new Date());

  if (envConfig.isProduction && dayOfWeek !== DayOfWeek.Sunday && dayOfWeek !== DayOfWeek.Monday && dayOfWeek !== DayOfWeek.Tuesday) {
    return callback();
  }

  const { chatId, message, user } = ctx.myContext;

  const quizDate = getQuizDate(chatId);
  const userId = ctx.myContext.user?.id;

  if (!isNotNullOrUndefined(user) || !isNotNullOrUndefined(userId)) {
    return callback();
  }

  const numberOfInvitees = getNumberOfInviteesFromEmoji(message?.text);

  if (numberOfInvitees === -1) {
    return callback();
  }

  if (numberOfInvitees === 0) {
    if (!playerHasInvitations(chatId, user)) {
      return callback();
    }

    await ctx.telegram.sendMessage(chatId, `<b>${user.first_name}</b> revoked their previous invitations! ${PLAYER_OUT_EMOJI}`, {
      parse_mode: 'HTML',
    });
  } else {
    await ctx.telegram.sendMessage(
      chatId,
      `<b>${user.first_name}</b> invited <b>${numberOfInvitees}</b> ${pluralize('player', numberOfInvitees)}! 🍺`,
      { parse_mode: 'HTML' },
    );
  }

  addPlayersExternal(chatId, user, numberOfInvitees);

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

export default createConfirmGuests;
