require('dotenv').config();

import cron from 'node-cron';
import pluralize from 'pluralize';
import { Telegraf } from 'telegraf';
import { getISODay } from 'date-fns';

import contextMiddleware from './middleware/contextMiddleware';
import envConfig from './config/env';
import getNumberOfInviteesFromEmoji from './utils/state/getNumberOfInviteesFromEmoji';
import isNotNullOrUndefined from './utils/misc/isNotNullOrUndefined';
import stateMiddleware, {
  addPlayer,
  addPlayersExternal,
  getLineup,
  getPlayerCount,
  getQuizDate,
  isUserPlayingAlready,
  removePlayer,
  resetState,
  setLineupComplete,
} from './middleware/stateMiddleware';
import { LINEUP_COMPLETE, OVERBOOKED, TUTORIAL_LINE_1, TUTORIAL_LINE_2, TUTORIAL_LINE_3, TUTORIAL_LINE_4 } from './config/texts';

// Types
import { DayOfWeek } from './types';
import { KittyBotContext } from './middleware/contextMiddleware';

const MAX_PLAYERS = 8;

const bot = new Telegraf<KittyBotContext>(envConfig.botToken);

// Middlewares
bot.use(contextMiddleware);
bot.use(stateMiddleware);

// Commands
bot.hears(new RegExp('([1️⃣,2️⃣,3️⃣,4️⃣,5️⃣])'), async ctx => {
  const dayOfWeek = getISODay(new Date());

  if (dayOfWeek !== DayOfWeek.Sunday && dayOfWeek !== DayOfWeek.Monday && dayOfWeek !== DayOfWeek.Tuesday) {
    return;
  }

  const { chatId, message, user } = ctx.myContext;

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
});

bot.hears(new RegExp('(👍)'), async ctx => {
  const dayOfWeek = getISODay(new Date());

  if (dayOfWeek !== DayOfWeek.Sunday && dayOfWeek !== DayOfWeek.Monday && dayOfWeek !== DayOfWeek.Tuesday) {
    return;
  }

  const { chatId, user } = ctx.myContext;

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

  await ctx.telegram.sendMessage(chatId, `🥒🐭 ${user.first_name} is in! 🍺`);

  const playerCount = getPlayerCount(chatId);

  if (playerCount < 8) {
    await ctx.telegram.sendMessage(
      chatId,
      `We have <b>${playerCount}</b> confirmed ${pluralize('player', playerCount)} for the <b>${quizDate}</B>.`,
      { parse_mode: 'HTML' },
    );
  }

  if (playerCount >= MAX_PLAYERS) {
    await ctx.telegram.sendMessage(chatId, LINEUP_COMPLETE);

    const lineup = getLineup(chatId);

    await ctx.telegram.sendMessage(chatId, `Our lineup for the <b>${quizDate}</B>: ${lineup}.`, { parse_mode: 'HTML' });
    await ctx.telegram.sendMessage(chatId, `Total: ${playerCount}`);
  }

  if (playerCount > MAX_PLAYERS) {
    await ctx.telegram.sendMessage(chatId, OVERBOOKED);
  }
});

bot.hears(new RegExp('(👎)'), async ctx => {
  const dayOfWeek = getISODay(new Date());

  if (
    dayOfWeek !== DayOfWeek.Sunday &&
    dayOfWeek !== DayOfWeek.Monday &&
    dayOfWeek !== DayOfWeek.Tuesday &&
    dayOfWeek !== DayOfWeek.Wednesday
  ) {
    return;
  }

  const { chatId, user } = ctx.myContext;

  const quizDate = getQuizDate(chatId);
  const userId = ctx.myContext.user?.id;

  if (!isNotNullOrUndefined(user) || !isNotNullOrUndefined(userId)) {
    return;
  }

  // User is already playing in this week's quiz.
  if (!isUserPlayingAlready(chatId, userId)) {
    return;
  }

  removePlayer(chatId, user);

  await ctx.telegram.sendMessage(chatId, `🥒🐭 ${user.first_name} is out! 🧂`);

  const playerCount = getPlayerCount(chatId);

  if (playerCount < 8) {
    await ctx.telegram.sendMessage(
      chatId,
      `We have <b>${playerCount}</b> confirmed ${pluralize('player', playerCount)} for the <b>${quizDate}</B>.`,
      { parse_mode: 'HTML' },
    );
  }

  if (playerCount >= MAX_PLAYERS) {
    await ctx.telegram.sendMessage(chatId, LINEUP_COMPLETE);

    setLineupComplete(chatId);

    const lineup = getLineup(chatId);

    await ctx.telegram.sendMessage(chatId, `Our lineup for the <b>${quizDate}</B>: ${lineup}.`, { parse_mode: 'HTML' });
    await ctx.telegram.sendMessage(chatId, `Total: ${playerCount}`);
  }

  if (playerCount > MAX_PLAYERS) {
    await ctx.telegram.sendMessage(chatId, OVERBOOKED);
  }
});

bot.command('lineup', async ctx => {
  const { chatId, state } = ctx.myContext;

  const dayOfWeek = getISODay(new Date());

  if (
    dayOfWeek !== DayOfWeek.Sunday &&
    dayOfWeek !== DayOfWeek.Monday &&
    dayOfWeek !== DayOfWeek.Tuesday &&
    dayOfWeek !== DayOfWeek.Wednesday
  ) {
    await ctx.telegram.sendMessage(chatId, `We start forming the lineup for next week on Sunday.`);

    return;
  }

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
});

// bot.command('final', async ctx => {
//   const { chatId } = ctx.myContext;

//   const dayOfWeek = getISODay(new Date());

//   if (
//     dayOfWeek !== DayOfWeek.Sunday &&
//     dayOfWeek !== DayOfWeek.Monday &&
//     dayOfWeek !== DayOfWeek.Tuesday &&
//     dayOfWeek !== DayOfWeek.Wednesday
//   ) {
//     await ctx.telegram.sendMessage(chatId, `We start forming the lineup for next week on Sunday.`);

//     return;
//   }

//   if (getPlayerCount(chatId) === 0) {
//     await ctx.telegram.sendMessage(chatId, `Are you sure? We have no players yet.`);

//     return;
//   }

//   setLineupComplete(chatId);

//   await ctx.telegram.sendMessage(chatId, LINEUP_COMPLETE);

//   const lineup = getLineup(chatId);

//   await ctx.telegram.sendMessage(chatId, lineup, { parse_mode: 'HTML' });
// });

bot.hears('!reset', async ctx => {
  const { chatId } = ctx.myContext;

  resetState(chatId);

  await ctx.telegram.sendMessage(chatId, `State was reset.`);
});

const sendIntro = async () => {
  const chatId = envConfig.pubQuizGroupId;
  const quizDate = getQuizDate(chatId);

  await bot.telegram?.sendMessage(
    chatId,
    `🍻 QUIZZY TIME 🍻\n\nWho's in for quizzy on the <b>${quizDate}</B>?\n\n${TUTORIAL_LINE_1}\n\n${TUTORIAL_LINE_2}\n\n${TUTORIAL_LINE_3}\n\n${TUTORIAL_LINE_4}`,
    { parse_mode: 'HTML' },
  );
};

const sendReminder = async () => {
  const chatId = envConfig.pubQuizGroupId;

  const playerCount = getPlayerCount(chatId);

  if (playerCount < MAX_PLAYERS) {
    await bot.telegram?.sendMessage(
      chatId,
      `🍻 REMINDER: We still have empty spots! 🍻\n\n${TUTORIAL_LINE_1}\n\n${TUTORIAL_LINE_2}\n\n${TUTORIAL_LINE_3}\n\n${TUTORIAL_LINE_4}`,
      { parse_mode: 'HTML' },
    );
  }
};

const main = async () => {
  await bot.launch();

  console.log('Kitty Bot is online!');

  if (envConfig.isProduction) {
    bot.telegram?.sendMessage(envConfig.adminUserId, `KittyBot started`);
  }

  cron.schedule('0 12 * * 0', () => {
    sendIntro();
  });

  cron.schedule('0 10 * * 1', () => {
    sendReminder();
  });

  process.once('SIGINT', () => {
    bot.telegram?.sendMessage(envConfig.adminUserId, `KittyBot shutdown: SIGINT`);

    bot.stop('SIGINT');
  });

  process.once('SIGTERM', () => {
    bot.telegram?.sendMessage(envConfig.adminUserId, `KittyBot shutdown: SIGTERM`);

    bot.stop('SIGTERM');
  });
};

main();
