require('dotenv').config();

import pluralize from 'pluralize';
import { Telegraf } from 'telegraf';
import { isAfter, format, getISODay } from 'date-fns';
import { uniqBy } from 'lodash';

import envConfig from './config/env';
import findNextWednesday from './utils/date/findNextWednesday';
import isNotNullOrUndefined from './utils/misc/isNotNullOrUndefined';

// Types
import { ChatMember } from 'telegraf/typings/core/types/typegram';
import { Context } from 'telegraf';
import { DayOfWeek } from './types';
import contextMiddleware, { KittyBotContext } from './middleware/contextMiddleware';
import stateMiddleware from './middleware/stateMiddleware';
import { LINEUP_COMPLETE } from './config/texts';
import getNumberOfInviteesFromEmoji from './utils/emoji/getNumberOfInviteesFromEmoji';

const bot = new Telegraf<KittyBotContext>(envConfig.botToken);

// TODO: I'm out

// Setup
bot.use(contextMiddleware);

// State Management
bot.use(stateMiddleware);

// bot.use(async (ctx, next) => {
//   const { chatId } = ctx.myContext;

//   const dayOfWeek = getISODay(new Date());

//   // TODO: This does need to be timed somehow, otherwise we would need to write something on sunday so it triggers
//   if (dayOfWeek === DayOfWeek.Sunday) {
//     if (!state.isIntroSent) {
//       await ctx.telegram.sendMessage(chatId, `🍻 QUIZZY TIME 🍻`);
//       await ctx.telegram.sendMessage(chatId, `Who's in for quizzy on the <b>${format(state.quizDate, `do 'of' MMMM`)}</B>?`, {
//         parse_mode: 'HTML',
//       });
//       await ctx.telegram.sendMessage(chatId, TUTORIAL_LINE_1);
//       await ctx.telegram.sendMessage(chatId, TUTORIAL_LINE_2);
//       await ctx.telegram.sendMessage(chatId, TUTORIAL_LINE_3, { parse_mode: 'HTML' });
//       await ctx.telegram.sendMessage(chatId, TUTORIAL_LINE_4, { parse_mode: 'HTML' });

//       state.isIntroSent = true;
//     }
//   }

//   if (dayOfWeek === DayOfWeek.Monday) {
//     if (!state.isLineupComplete && !state.isReminder1Sent) {
//       if (getPlayersCount() < 8) {
//         await ctx.telegram.sendMessage(chatId, `🍻 REMINDER: We still have empty spots! 🍻`);
//         await ctx.telegram.sendMessage(chatId, TUTORIAL_LINE_1);
//         await ctx.telegram.sendMessage(chatId, TUTORIAL_LINE_2);
//         await ctx.telegram.sendMessage(chatId, TUTORIAL_LINE_3, { parse_mode: 'HTML' });
//         await ctx.telegram.sendMessage(chatId, TUTORIAL_LINE_4, { parse_mode: 'HTML' });

//         state.isReminder1Sent = true;
//       }
//     }
//   }

//   return next();
// });

// TODO: SCOPE STATE TO CHAT ID

bot.start(async ctx => {
  console.log('hi!');
  await ctx.telegram.sendMessage(envConfig.adminUserId, 'Started');
  console.log('hi?');
});

bot.hears(new RegExp('([1️⃣,2️⃣,3️⃣,4️⃣,5️⃣])'), async ctx => {
  const dayOfWeek = getISODay(new Date());

  if (dayOfWeek !== DayOfWeek.Sunday && dayOfWeek !== DayOfWeek.Monday && dayOfWeek !== DayOfWeek.Tuesday) {
    return;
  }

  const { addPlayersExternal, chatId, getQuizDate, getLineup, message, getPlayerCount, user } = ctx.myContext;

  const lineup = getLineup(chatId);

  const quizDate = getQuizDate(chatId);
  const userId = ctx.myContext.user?.id;

  if (!isNotNullOrUndefined(user) || !isNotNullOrUndefined(userId)) {
    return;
  }

  const numberOfInvitees = getNumberOfInviteesFromEmoji(message?.text);

  if (numberOfInvitees === 0) {
    return;
  }

  addPlayersExternal(chatId, user, numberOfInvitees);

  await ctx.telegram.sendMessage(chatId, `${user.first_name} invited ${numberOfInvitees} ${pluralize('player', numberOfInvitees)}! 🍺`);

  const playerCount = getPlayerCount(chatId);

  if (playerCount < 8) {
    await ctx.telegram.sendMessage(
      chatId,
      `We have <b>${playerCount}</b> ${pluralize('player', playerCount)} confirmed for the <b>${quizDate}</B>.`,
      { parse_mode: 'HTML' },
    );
  }

  if (playerCount >= 8) {
    await ctx.telegram.sendMessage(chatId, LINEUP_COMPLETE);

    await ctx.telegram.sendMessage(chatId, lineup, { parse_mode: 'HTML' });
  }
});

bot.hears(new RegExp('(👆)'), async ctx => {
  const dayOfWeek = getISODay(new Date());

  if (dayOfWeek !== DayOfWeek.Sunday && dayOfWeek !== DayOfWeek.Monday && dayOfWeek !== DayOfWeek.Tuesday) {
    return;
  }

  const { addPlayer, chatId, getQuizDate, getLineup, isUserPlayingAlready, getPlayerCount, user } = ctx.myContext;

  const lineup = getLineup(chatId);
  const quizDate = getQuizDate(chatId);
  const userId = ctx.myContext.user?.id;

  if (!isNotNullOrUndefined(user) || !isNotNullOrUndefined(userId)) {
    return;
  }

  // User is already playing in this week's quiz.
  if (isUserPlayingAlready(chatId, userId)) {
    return;
  }

  addPlayer(chatId, user);

  await ctx.telegram.sendMessage(chatId, `${user.first_name} is in! 🍺`);

  const playerCount = getPlayerCount(chatId);

  if (playerCount < 8) {
    await ctx.telegram.sendMessage(
      chatId,
      `We have <b>${playerCount}</b> ${pluralize('player', playerCount)} confirmed for the <b>${quizDate}</B>.`,
      { parse_mode: 'HTML' },
    );
  }

  if (playerCount >= 8) {
    await ctx.telegram.sendMessage(chatId, LINEUP_COMPLETE);

    const lineup = getLineup(chatId);

    await ctx.telegram.sendMessage(chatId, `Our lineup for the <b>${quizDate}</B>: ${lineup}.`, { parse_mode: 'HTML' });
    await ctx.telegram.sendMessage(chatId, `Total: ${playerCount}`);
  }

  if (playerCount > 2) {
    await ctx.telegram.sendMessage(chatId, `Oh oh, we're overbooked. What now?`);
  }
});

bot.hears('!lineup', async ctx => {
  const { chatId, getLineup, getPlayerCount, getQuizDate, state } = ctx.myContext;

  const playerCount = getPlayerCount(chatId);
  const quizDate = getQuizDate(chatId);

  if (playerCount === 0) {
    await ctx.telegram.sendMessage(chatId, `We have no confirmed players for the <b>${quizDate}</B> at the moment.`, {
      parse_mode: 'HTML',
    });

    return;
  }

  const lineup = getLineup(chatId);

  await ctx.telegram.sendMessage(chatId, lineup, { parse_mode: 'HTML' });

  if (state[chatId].isLineupComplete) {
    await ctx.telegram.sendMessage(chatId, `This lineup is final.`);
  }
});

//
// !final
//

bot.hears('!final', async ctx => {
  const { chatId, getLineup, getPlayerCount, getQuizDate, setLineupComplete } = ctx.myContext;

  if (getPlayerCount(chatId) === 0) {
    await ctx.telegram.sendMessage(chatId, `Are you sure? We have no players yet.`);

    return;
  }

  setLineupComplete(chatId);

  await ctx.telegram.sendMessage(chatId, LINEUP_COMPLETE);

  const lineup = getLineup(chatId);
  const quizDate = getQuizDate(chatId);

  await ctx.telegram.sendMessage(chatId, `Our lineup for the <b>${quizDate}</B>: ${lineup}.`, { parse_mode: 'HTML' });
});

//
// !reset
//

bot.hears('!reset', async ctx => {
  const { chatId, resetState } = ctx.myContext;

  resetState(chatId);

  await ctx.telegram.sendMessage(chatId, `State was reset.`);
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
