require('dotenv').config();

import cron from 'node-cron';
import pluralize from 'pluralize';
import { Telegraf } from 'telegraf';
import { getISODay } from 'date-fns';

import contextMiddleware from './middleware/contextMiddleware';
import envConfig from './config/env';
import getNumberOfInviteesFromEmoji from './utils/state/getNumberOfInviteesFromEmoji';
import getRandomHelloGif from './utils/misc/getRandomHelloGif';
import isNotNullOrUndefined from './utils/misc/isNotNullOrUndefined';
import sendLineupEmail from './utils/email/sendLineupEmail';
import stateMiddleware, {
  addPlayer,
  addPlayersExternal,
  getLineup,
  getPlayerCount,
  getPlayerOutCount,
  getQuizDate,
  isEmailSent,
  isStateDefined,
  isUserOutAlready,
  isUserPlayingAlready,
  playerHasInvitations,
  removePlayer,
  resetState,
  setEmailSent,
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
bot.hears(new RegExp('([0️⃣,1️⃣,2️⃣,3️⃣,4️⃣,5️⃣,6️⃣,7️⃣,8️⃣])'), async ctx => {
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

  if (numberOfInvitees === -1) {
    return;
  }

  if (numberOfInvitees === 0) {
    if (!playerHasInvitations(chatId, user)) {
      return;
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

  await ctx.telegram.sendMessage(chatId, `🥒🐭 <b>${user.first_name}</b> is in! 🍺`, { parse_mode: 'HTML' });

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
  if (isUserOutAlready(chatId, userId)) {
    return;
  }

  removePlayer(chatId, user);

  await ctx.telegram.sendMessage(chatId, `🥒🐭 <b>${user.first_name}</b> is out! 🧂`, { parse_mode: 'HTML' });

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

bot.hears(new RegExp('hallöchen', 'i'), async ctx => {
  const { chatId, message, user } = ctx.myContext;

  const messageId = message?.message_id;

  if (!isNotNullOrUndefined(messageId)) {
    return;
  }

  if (isNotNullOrUndefined(user) && user.id === 47647715) {
    await ctx.telegram.sendAnimation(
      chatId,
      'https://media1.giphy.com/media/dIBzteMy7M5H6iy7CX/giphy.gif?cid=790b761109a8d3ff6790e885fdc6b4e58e56b4bb9d918aec&rid=giphy.gif&ct=g',
      { reply_to_message_id: messageId },
    );

    return;
  }

  try {
    await ctx.telegram.sendAnimation(chatId, getRandomHelloGif(), { reply_to_message_id: messageId });
  } catch {
    // Do nothing
  }
});

bot.hears(new RegExp('hallihallo', 'i'), async ctx => {
  const { chatId, message } = ctx.myContext;

  const messageId = message?.message_id;

  if (!isNotNullOrUndefined(messageId)) {
    return;
  }

  try {
    await ctx.telegram.sendAnimation(
      chatId,
      'https://media4.giphy.com/media/ULgyBIoljSnrnih7pJ/giphy.gif?cid=790b76112f6603b75be9db813ee4264cb72aba46265777fe&rid=giphy.gif&ct=g',
      {
        reply_to_message_id: messageId,
      },
    );
  } catch {
    // Do nothing
  }
});

bot.command('lineup', async ctx => {
  const { chatId } = ctx.myContext;

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
  const playerOutCount = getPlayerOutCount(chatId);
  const quizDate = getQuizDate(chatId);

  if (playerCount + playerOutCount === 0) {
    await ctx.telegram.sendMessage(chatId, `We have no confirmed players for the <b>${quizDate}</B> at the moment.`, {
      parse_mode: 'HTML',
    });

    return;
  }

  const lineup = getLineup(chatId);

  await ctx.telegram.sendMessage(chatId, lineup, { parse_mode: 'HTML' });
});

bot.hears('!final', async ctx => {
  const { chatId } = ctx.myContext;

  const dayOfWeek = getISODay(new Date());
  const playerCount = getPlayerCount(chatId);

  if (dayOfWeek !== DayOfWeek.Sunday && dayOfWeek !== DayOfWeek.Monday && dayOfWeek !== DayOfWeek.Tuesday) {
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
});

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

const sendEmailReminder = async () => {
  const chatId = envConfig.pubQuizGroupId;

  if (!isEmailSent(chatId)) {
    await bot.telegram?.sendMessage(
      chatId,
      `⚠️ We still haven't sent Scott the mail with our lineup. Write <code>!final</code> to send it now. ⚠️`,
      { parse_mode: 'HTML' },
    );
  }
};

const main = async () => {
  const chatId = envConfig.pubQuizGroupId;

  await bot.launch();

  console.log('Kitty Bot is online!');

  if (!isStateDefined(chatId)) {
    resetState(chatId);
  }

  if (envConfig.isProduction) {
    bot.telegram?.sendMessage(envConfig.adminUserId, `KittyBot started`);
  }

  cron.schedule('0 12 * * 0', () => {
    sendIntro();
  });

  cron.schedule('0 10 * * 1', () => {
    sendReminder();
  });

  cron.schedule('0 10 * * 2', () => {
    sendReminder();
  });

  cron.schedule('0 15 * * 2', () => {
    sendEmailReminder();
  });

  process.once('SIGINT', () => {
    if (envConfig.isProduction) {
      bot.telegram?.sendMessage(envConfig.adminUserId, `KittyBot shutdown: SIGINT`);
    }

    bot.stop('SIGINT');
  });

  process.once('SIGTERM', () => {
    if (envConfig.isProduction) {
      bot.telegram?.sendMessage(envConfig.adminUserId, `KittyBot shutdown: SIGTERM`);
    }

    bot.stop('SIGTERM');
  });
};

main();
