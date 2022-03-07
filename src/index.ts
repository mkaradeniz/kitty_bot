require('dotenv').config();

import pluralize from 'pluralize';
import { Telegraf } from 'telegraf';
import { addDays, isAfter, endOfDay, format, getISODay } from 'date-fns';
import { uniqBy } from 'lodash';

import envConfig from './config/env';
import findNextWednesday from './utils/date/findNextWednesday';
import isNotNullOrUndefined from './utils/misc/isNotNullOrUndefined';

// Types
import { DayOfWeek } from './types';
import { ChatMember } from 'telegraf/typings/core/types/typegram';

const bot = new Telegraf(envConfig.botToken);

type State = {
  isIntroSent: boolean;
  isLineupComplete: boolean;
  isReminder1Sent: boolean;
  players: ChatMember[];
  playersExternal: { invitedBy: ChatMember }[];
  quizDate: Date;
};

let state: State = {
  isIntroSent: false,
  isLineupComplete: false,
  isReminder1Sent: false,
  players: [],
  playersExternal: [],
  quizDate: findNextWednesday(),
};

const getPlayersCount = () => {
  return state.players.length + state.playersExternal.length;
};

const LINEUP_COMPLETE = `🍻 We did it! Our lineup is complete! 🍻`;
const TUTORIAL_LINE_1 = `Send a 👆 if you're in.`;
const TUTORIAL_LINE_2 = `If you're bringing others, post how many with 1️⃣2️⃣3️⃣4️⃣5️⃣.`;
const TUTORIAL_LINE_3 = `Write <code>!lineup</code> to see the current list of players for this week.`;
const TUTORIAL_LINE_4 = `Write <code>!final</code> to finalize this week's lineup.`;

bot.use(async (ctx, next) => {
  const chatId = ctx?.message?.chat.id;

  if (!isNotNullOrUndefined(chatId)) {
    await next();

    console.timeEnd(`Processing update ${ctx.update.update_id}`);

    return;
  }

  if (isAfter(new Date(), state.quizDate)) {
    // Reset State
    state = {
      isIntroSent: false,
      isLineupComplete: false,
      isReminder1Sent: false,
      players: [],
      playersExternal: [],
      quizDate: findNextWednesday(),
    };
  }

  const dayOfWeek = getISODay(new Date());

  // TODO: This does need to be timed somehow, otherwise we would need to write something on sunday so it triggers
  if (dayOfWeek === DayOfWeek.Sunday) {
    if (!state.isIntroSent) {
      await ctx.telegram.sendMessage(chatId, `🍻 QUIZZY TIME 🍻`);
      await ctx.telegram.sendMessage(chatId, `Who's in for quizzy on the <b>${format(state.quizDate, `do 'of' MMMM`)}</B>?`, {
        parse_mode: 'HTML',
      });
      await ctx.telegram.sendMessage(chatId, TUTORIAL_LINE_1);
      await ctx.telegram.sendMessage(chatId, TUTORIAL_LINE_2);
      await ctx.telegram.sendMessage(chatId, TUTORIAL_LINE_3, { parse_mode: 'HTML' });
      await ctx.telegram.sendMessage(chatId, TUTORIAL_LINE_4, { parse_mode: 'HTML' });

      state.isIntroSent = true;
    }
  }

  if (dayOfWeek === DayOfWeek.Monday) {
    if (!state.isLineupComplete && !state.isReminder1Sent) {
      if (getPlayersCount() < 8) {
        await ctx.telegram.sendMessage(chatId, `🍻 REMINDER: We still have empty spots! 🍻`);
        await ctx.telegram.sendMessage(chatId, TUTORIAL_LINE_1);
        await ctx.telegram.sendMessage(chatId, TUTORIAL_LINE_2);
        await ctx.telegram.sendMessage(chatId, TUTORIAL_LINE_3, { parse_mode: 'HTML' });
        await ctx.telegram.sendMessage(chatId, TUTORIAL_LINE_4, { parse_mode: 'HTML' });

        state.isReminder1Sent = true;
      }
    }
  }

  await next();
});

bot.start(ctx => {
  ctx.telegram.sendMessage(ctx.message.chat.id, 'Started');
});

bot.hears(new RegExp('([👆])'), async ctx => {
  const dayOfWeek = getISODay(new Date());

  if (dayOfWeek !== DayOfWeek.Sunday && dayOfWeek !== DayOfWeek.Monday && dayOfWeek !== DayOfWeek.Tuesday) {
    return;
  }

  const chatId = ctx.message.chat.id;
  const userId = ctx.message.from.id;

  // User is already playing in this week's quiz.
  if (state.players.findIndex(participant => participant.user.id === userId) > -1) {
    return;
  }

  const user = await ctx.telegram.getChatMember(chatId, userId);

  const nextPlayers = uniqBy([...state.players, user], participant => participant.user.id);

  state.players = nextPlayers;

  await ctx.telegram.sendMessage(chatId, `${ctx.message.from.first_name} is in! 🍺`);

  if (getPlayersCount() < 8) {
    await ctx.telegram.sendMessage(
      chatId,
      `We have <b>${getPlayersCount()}</b> ${pluralize('player', getPlayersCount())} confirmed for the <b>${format(
        state.quizDate,
        `do 'of' MMMM`,
      )}</B>.`,
      { parse_mode: 'HTML' },
    );
  }

  if (getPlayersCount() === 8) {
    await ctx.telegram.sendMessage(chatId, LINEUP_COMPLETE);

    const lineup = state.players
      .slice()
      .sort((a, b) => b.user.first_name.localeCompare(a.user.first_name))
      .map(player => player.user.first_name)
      .join(',');

    await ctx.telegram.sendMessage(chatId, `Our lineup for the <b>${format(state.quizDate, `do 'of' MMMM`)}</B>: ${lineup}.`, {
      parse_mode: 'HTML',
    });
  }
});

bot.hears('!lineup', async ctx => {
  const chatId = ctx.message.chat.id;

  if (!isNotNullOrUndefined(state)) {
    return;
  }

  if (state.players.length === 0) {
    await ctx.telegram.sendMessage(
      chatId,
      `We have no confirmed players for the <b>${format(state.quizDate, `do 'of' MMMM`)}</B> at the moment.`,
      { parse_mode: 'HTML' },
    );

    return;
  }

  await ctx.telegram.sendMessage(chatId, `Confirmed for the <b>${format(state.quizDate, `do 'of' MMMM`)}</B> are:`, { parse_mode: 'HTML' });

  for (const participant of state.players.slice().sort((a, b) => b.user.first_name.localeCompare(a.user.first_name))) {
    await ctx.telegram.sendMessage(chatId, `${participant.user.first_name}`);
  }

  await ctx.telegram.sendMessage(chatId, `Total: ${state.players.length}`);

  if (state.isLineupComplete) {
    await ctx.telegram.sendMessage(chatId, `This lineup is final.`);
  }
});

bot.hears('!final', async ctx => {
  const chatId = ctx.message.chat.id;

  if (!isNotNullOrUndefined(state)) {
    return;
  }

  if (getPlayersCount() === 0) {
    await ctx.telegram.sendMessage(chatId, `Are you sure? We have no players yet.`);

    return;
  }

  state.isLineupComplete = true;

  await ctx.telegram.sendMessage(chatId, LINEUP_COMPLETE);

  const lineup = state.players
    .slice()
    .sort((a, b) => b.user.first_name.localeCompare(a.user.first_name))
    .map(player => player.user.first_name)
    .join(',');

  await ctx.telegram.sendMessage(chatId, `Our lineup for the <b>${format(state.quizDate, `do 'of' MMMM`)}</B>: ${lineup}.`, {
    parse_mode: 'HTML',
  });
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
