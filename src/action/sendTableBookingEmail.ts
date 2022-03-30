import { getISODay } from 'date-fns';

import envConfig from '../config/env';
import sendLineupEmail from '../utils/misc/sendLineupEmail';
import { LINEUP_COMPLETE } from '../config/texts';
import { getLineup, getPlayerCount, isEmailSent, setEmailSent } from '../middleware/stateMiddleware';

// Types
import { DayOfWeek } from '../types';
import { KittyBotContext } from '../middleware/contextMiddleware';
import { Telegraf } from 'telegraf';

const createSendTableBookingEmail = (bot: Telegraf<KittyBotContext>) => async (ctx: KittyBotContext) => {
  const { chatId } = ctx.myContext;

  const dayOfWeek = getISODay(new Date());
  const playerCount = getPlayerCount(chatId);

  if (envConfig.isProduction && dayOfWeek !== DayOfWeek.Sunday && dayOfWeek !== DayOfWeek.Monday && dayOfWeek !== DayOfWeek.Tuesday) {
    await ctx.telegram.sendMessage(chatId, `We start forming the lineup for next week on Sunday.`);

    return;
  }

  if (playerCount === 0) {
    await ctx.telegram.sendMessage(chatId, `Are you sure? We have no players yet.`);

    return;
  }

  if (!isEmailSent(chatId)) {
    try {
      await sendLineupEmail(playerCount);

      setEmailSent(chatId);
    } catch (err) {
      console.error(err);

      bot.telegram?.sendMessage(envConfig.adminUserId, `Mail Sending failed. Check logs.`);
    }
  }

  await ctx.telegram.sendMessage(chatId, LINEUP_COMPLETE);

  const lineup = getLineup(chatId);

  await ctx.telegram.sendMessage(chatId, lineup, { parse_mode: 'HTML' });
};

export default createSendTableBookingEmail;
