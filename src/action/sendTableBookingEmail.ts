import { getISODay } from 'date-fns';

import envConfig from '../config/env';
import sendLineupEmail from '../utils/misc/sendLineupEmail';
import { getPlayerCount, isEmailSent, setEmailSent } from '../middleware/stateMiddleware';

// Types
import { DayOfWeek } from '../types';
import { KittyBotContext } from '../middleware/contextMiddleware';
import { Telegraf } from 'telegraf';

const createSendTableBookingEmail = (bot: Telegraf<KittyBotContext>) => async (ctx: KittyBotContext) => {
  try {
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

        await ctx.telegram.sendMessage(chatId, `💌 I just sent ${envConfig.emailToName} a (love-)letter.`);
      } catch (err) {
        console.error(err);

        await bot.telegram?.sendMessage(envConfig.adminUserId, `Mail sending failed. Check logs.`);

        await ctx.telegram.sendMessage(chatId, `Mail sending failed. Please contact ${envConfig.emailToName} manually.`);
      }
    }
  } catch (err) {
    console.error(err);
  }
};

export default createSendTableBookingEmail;
