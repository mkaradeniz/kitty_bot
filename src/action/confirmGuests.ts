import pluralize from 'pluralize';
import { getISODay } from 'date-fns';

import envConfig from '../config/env';
import getNumberOfInviteesFromEmoji from '../utils/state/getNumberOfInviteesFromEmoji';
import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';
import { LINEUP_COMPLETE, OVERBOOKED } from '../config/texts';
import { MAX_PLAYERS } from '../config/constants';
import { addPlayersExternal, getLineup, getPlayerCount, getQuizDate, playerHasInvitations } from '../middleware/stateMiddleware';

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

    await ctx.telegram.sendMessage(chatId, `<b>${user.first_name}</b> revoked their previous invitations! 🧂`, { parse_mode: 'HTML' });
  } else {
    await ctx.telegram.sendMessage(
      chatId,
      `<b>${user.first_name}</b> invited <b>${numberOfInvitees}</b> ${pluralize('player', numberOfInvitees)}! 🍺`,
      { parse_mode: 'HTML' },
    );
  }

  addPlayersExternal(chatId, user, numberOfInvitees);

  const playerCount = getPlayerCount(chatId);

  if (playerCount < 8) {
    await ctx.telegram.sendMessage(
      chatId,
      `We have <b>${playerCount}</b> confirmed ${pluralize('player', playerCount)} for the <b>${quizDate}</B>.`,
      { parse_mode: 'HTML' },
    );
  }

  if (playerCount >= MAX_PLAYERS) {
    const lineup = getLineup(chatId);

    await ctx.telegram.sendMessage(chatId, LINEUP_COMPLETE);

    await ctx.telegram.sendMessage(chatId, lineup, { parse_mode: 'HTML' });
  }

  if (playerCount > MAX_PLAYERS) {
    await ctx.telegram.sendMessage(chatId, OVERBOOKED);
  }

  return callback();
};

export default createConfirmGuests;
