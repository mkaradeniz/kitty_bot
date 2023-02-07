require('dotenv').config();

import cron from 'node-cron';
import stringify from 'safe-json-stringify';
import { Telegraf } from 'telegraf';
import { fmt, code } from 'telegraf/format';

import calculateLastQuizsBenchedPlayersBenchCount from './action/calculateLastQuizsBenchedPlayersBenchCount';
import contextMiddleware from './middleware/contextMiddleware';
import createBenchPlayer from './action/benchPlayer';
import createConfirmGuests from './action/confirmGuests';
import createConfirmPlayer from './action/confirmPlayer';
import createLottery from './action/lottery';
import createResetCurrentQuizCommand from './action/resetState';
import createSendAdminMessage from './utils/message/createSendAdminMessage';
import createSendEmailReminder from './action/contextless/sendEmailReminder';
import createSendIntro from './action/contextless/sendIntro';
import createSendLineup from './action/sendLineup';
import createSendReminder from './action/contextless/sendReminder';
import createSendTableBookingCancelEmail from './action/sendTableBookingCancelEmail';
import createSendTableBookingEmail from './action/sendTableBookingEmail';
import createUnconfirmPlayer from './action/unconfirmPlayer';
import dbMiddleware from './middleware/dbMiddleware';
import envConfig from './config/env';
import getOrCreateCurrentQuizDb from './db/getOrCreateCurrentQuiz';
import isNotNullOrUndefined from './utils/misc/isNotNullOrUndefined';
import replyToHallihallo from './action/replyToHallihallo';
import replyToHallochen from './action/replyToHallochen';
import sendDebugCommand from './action/sendDebug';
import {
  CALLBACK_TYPE_BENCH,
  CALLBACK_TYPE_CONFIRM,
  CALLBACK_TYPE_LINEUP,
  CALLBACK_TYPE_LOTTERY,
  CALLBACK_TYPE_SEND_EMAIL,
  CALLBACK_TYPE_UNCONFIRM,
} from './config/constants';
import { EMOJI_CONFIRM, EMOJI_DECLINE, EMOJI_LINEUP, EMOJI_LOTTERY, EMOJI_PLAYER_BENCHED } from './config/texts';

// Types
import { MyBotContext } from './middleware/contextMiddleware';

const bot = new Telegraf<MyBotContext>(envConfig.botToken);

const sendAdminMessage = createSendAdminMessage(bot);

// Middlewares
bot.use(contextMiddleware);

bot.use(dbMiddleware);

// Callback Actions
bot.action(CALLBACK_TYPE_BENCH, createBenchPlayer(true));

bot.action(CALLBACK_TYPE_CONFIRM, createConfirmPlayer(true));

bot.action(CALLBACK_TYPE_LINEUP, createSendLineup(true));

bot.action(CALLBACK_TYPE_LOTTERY, createLottery({ isCallback: true }));

bot.action(CALLBACK_TYPE_SEND_EMAIL, createSendTableBookingEmail(true));

bot.action(CALLBACK_TYPE_UNCONFIRM, createUnconfirmPlayer(true));

// Hears
bot.hears(new RegExp('([0️⃣,1️⃣,2️⃣,3️⃣,4️⃣,5️⃣,6️⃣,7️⃣,8️⃣])'), createConfirmGuests());

bot.hears(new RegExp(`(${EMOJI_PLAYER_BENCHED})`), createBenchPlayer());

bot.hears(new RegExp(`(${EMOJI_CONFIRM})`), createConfirmPlayer());

bot.hears(new RegExp(`(${EMOJI_DECLINE})`), createUnconfirmPlayer());

bot.hears(new RegExp(`(${EMOJI_LINEUP})`), createSendLineup());

bot.hears(new RegExp(`(!${EMOJI_LOTTERY}${EMOJI_LOTTERY}${EMOJI_LOTTERY})`), createLottery({ isForced: true }));

bot.hears(new RegExp(`(${EMOJI_LOTTERY})`), createLottery());

bot.hears(new RegExp('hallihallo', 'i'), replyToHallihallo);

bot.hears(new RegExp('hallöchen', 'i'), replyToHallochen);

bot.hears('!cancel', createSendTableBookingCancelEmail());

bot.hears('!debug', sendDebugCommand);

bot.hears('!final', createSendTableBookingEmail());

bot.hears('!reset', createResetCurrentQuizCommand());

// Error Handling
bot.catch(async err => {
  console.error(err);

  void bot.launch();

  if (isNotNullOrUndefined(envConfig.adminUserId)) {
    await sendAdminMessage(`${envConfig.botName} crashed ⚰️ and restarted 🤖`);
    await sendAdminMessage(`Error was:`);
    await sendAdminMessage(fmt`${code(stringify(err as any, null, 2))}`);
  }
});

// Main
const main = async () => {
  if (envConfig.isProduction) {
    await sendAdminMessage(`${envConfig.botName} is online! 🤖`);
  }

  const sendEmailReminder = createSendEmailReminder(bot);
  const sendIntro = createSendIntro(bot);
  const sendReminder = createSendReminder(bot);

  // At 12:00 on Sunday.
  cron.schedule('0 12 * * 0', () => {
    void sendIntro();
  });

  // At 12:00 on Monday and Tuesday.
  cron.schedule('0 12 * * 1,2', () => {
    void sendReminder();
  });

  // At minute 0 past every hour from 15 through 18 on Tuesday.
  cron.schedule('0 15-18 * * 2', () => {
    void sendEmailReminder();
  });

  // At 02:00 on Thursday.
  cron.schedule('0 2 * * 4', async () => {
    // If we get the current quiz on a Thursday, we will automatically create the new one.
    await getOrCreateCurrentQuizDb();

    await calculateLastQuizsBenchedPlayersBenchCount();
  });

  process.once('SIGINT', async () => {
    if (envConfig.isProduction) {
      await sendAdminMessage(`${envConfig.botName} shutdown: SIGINT 😵`);
    }

    bot.stop('SIGINT');
  });

  process.once('SIGTERM', async () => {
    if (envConfig.isProduction) {
      await sendAdminMessage(`${envConfig.botName} shutdown: SIGTERM 😵`);
    }

    bot.stop('SIGTERM');
  });

  void bot.launch();

  console.info(`${envConfig.botName} is online! 🤖`);
};

void main();
