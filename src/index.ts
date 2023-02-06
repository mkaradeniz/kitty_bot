require('dotenv').config();

import cron from 'node-cron';
import stringify from 'safe-json-stringify';
import { Telegraf } from 'telegraf';
import { fmt, code } from 'telegraf/format';

import contextMiddleware from './middleware/contextMiddleware';
import createBenchPlayer from './action/benchPlayer';
import createConfirmGuests from './action/confirmGuests';
import createConfirmPlayer from './action/confirmPlayer';
import createLottery from './action/lottery';
import createSendEmailReminder from './action/sendEmailReminder';
import createSendIntro from './action/sendIntro';
import createSendLineup from './action/sendLineup';
import createSendReminder from './action/sendReminder';
import createSendTableBookingEmail from './action/sendTableBookingEmail';
import createUnconfirmPlayer from './action/unconfirmPlayer';
import dbMiddleware from './middleware/dbMiddleware';
import envConfig from './config/env';
import replyToHallihallo from './action/replyToHallihallo';
import replyToHallochen from './action/replyToHallochen';
import resetStateCommand from './action/resetState';
import sendStateCommand from './action/sendState';
import stateMiddleware, { isStateDefined, resetState } from './middleware/stateMiddleware';
import {
  CALLBACK_TYPE_BENCH,
  CALLBACK_TYPE_CONFIRM,
  CALLBACK_TYPE_LINEUP,
  CALLBACK_TYPE_LOTTERY,
  CALLBACK_TYPE_UNCONFIRM,
} from './config/constants';
import { CONFIRM_EMOJI, DECLINE_EMOJI, LINEUP_EMOJI, LOTTERY_EMOJI, PLAYER_BENCHED_EMOJI } from './config/texts';

// Types
import { KittyBotContext } from './middleware/contextMiddleware';

const bot = new Telegraf<KittyBotContext>(envConfig.botToken);

// Middlewares
bot.use(contextMiddleware);

bot.use(dbMiddleware);

bot.use(stateMiddleware);

// Callback Actions
bot.action(CALLBACK_TYPE_BENCH, createBenchPlayer(true));

bot.action(CALLBACK_TYPE_CONFIRM, createConfirmPlayer(true));

bot.action(CALLBACK_TYPE_LINEUP, createSendLineup(true));

bot.action(CALLBACK_TYPE_UNCONFIRM, createUnconfirmPlayer(true));

bot.action(CALLBACK_TYPE_LOTTERY, createLottery({ isCallback: true }));

// Commands
bot.command('lineup', createSendLineup());

// Hears
bot.hears(new RegExp('([0️⃣,1️⃣,2️⃣,3️⃣,4️⃣,5️⃣,6️⃣,7️⃣,8️⃣])'), createConfirmGuests());

bot.hears(new RegExp(`(${PLAYER_BENCHED_EMOJI})`), createBenchPlayer());

bot.hears(new RegExp(`(${CONFIRM_EMOJI})`), createConfirmPlayer());

bot.hears(new RegExp(`(${DECLINE_EMOJI})`), createUnconfirmPlayer());

bot.hears(new RegExp(`(${LINEUP_EMOJI})`), createSendLineup());

bot.hears(new RegExp(`(!${LOTTERY_EMOJI}${LOTTERY_EMOJI}${LOTTERY_EMOJI})`), createLottery({ isForced: true }));

bot.hears(new RegExp(`(${LOTTERY_EMOJI})`), createLottery());

bot.hears(new RegExp('hallöchen', 'i'), replyToHallochen);

bot.hears(new RegExp('hallihallo', 'i'), replyToHallihallo);

bot.hears('!final', createSendTableBookingEmail(bot));

bot.hears('!state', sendStateCommand);

bot.hears('!reset', resetStateCommand);

// Error Handling
bot.catch(async err => {
  console.error(err);

  void bot.launch();

  await bot.telegram?.sendMessage(envConfig.adminUserId, `KittyBot crashed: ⚰️ and restarted 🤖`);
  await bot.telegram?.sendMessage(envConfig.adminUserId, `Error was:`);
  await bot.telegram?.sendMessage(envConfig.adminUserId, fmt`${code(stringify(err as any, null, 2))}`);
});

// Main
const main = async () => {
  const chatId = envConfig.pubQuizGroupId;

  if (!isStateDefined(chatId)) {
    resetState(chatId);
  }

  if (envConfig.isProduction) {
    await bot.telegram?.sendMessage(envConfig.adminUserId, `KittyBot is online! 🤖`);

    await bot.telegram?.sendMessage(envConfig.pubQuizGroupId, `KittyBot is online. Hallöchen 🤖`);
  }

  const sendEmailReminder = createSendEmailReminder(bot);
  const sendIntro = createSendIntro(bot);
  const sendReminder = createSendReminder(bot);

  cron.schedule('0 12 * * 0', () => {
    void sendIntro();
  });

  cron.schedule('0 12 * * 1,2', () => {
    void sendReminder();
  });

  cron.schedule('0 15 * * 2', () => {
    void sendEmailReminder();
  });

  cron.schedule('0 2 * * 4', () => {
    // eslint-disable-next-line no-console
    console.info('Resetting state through cronjob.', new Date().toISOString());

    resetState(chatId);
  });

  process.once('SIGINT', async () => {
    if (envConfig.isProduction) {
      await bot.telegram?.sendMessage(envConfig.adminUserId, `KittyBot shutdown: SIGINT 😵`);

      await bot.telegram?.sendMessage(envConfig.pubQuizGroupId, `KittyBot is offline. Goodbye cruel world 😵`);
    }

    bot.stop('SIGINT');
  });

  process.once('SIGTERM', async () => {
    if (envConfig.isProduction) {
      await bot.telegram?.sendMessage(envConfig.adminUserId, `KittyBot shutdown: SIGTERM 😵`);

      await bot.telegram?.sendMessage(envConfig.pubQuizGroupId, `KittyBot is offline. Goodbye cruel world 😵`);
    }

    bot.stop('SIGTERM');
  });

  void bot.launch();

  // eslint-disable-next-line no-console
  console.info('Kitty Bot is online! 🤖');
};

// Start
void main();
