require('dotenv').config();

(BigInt.prototype as any)['toJSON'] = function () {
  return this.toString();
};

import cron from 'node-cron';
import { Telegraf } from 'telegraf';
import { code, fmt } from 'telegraf/format';

import calculateLastQuizsBenchedPlayersBenchCount from '@db/calculateLastQuizsBenchedPlayersBenchCount';
import contextMiddleware from '@middleware/contextMiddleware';
import createBenchPlayer from '@command/benchPlayer';
import createConfirmGuests from '@command/confirmGuests';
import createConfirmPlayer from '@command/confirmPlayer';
import createLottery from '@command/lottery';
import createResetCurrentQuizCommand from '@command/resetState';
import createSendAdminMessage from '@utils/message/createSendAdminMessage';
import createSendEmailReminder from '@message/sendEmailReminder';
import createSendIntro from '@message/sendIntro';
import createSendLineup from '@command/sendLineup';
import createSendReminder from '@message/sendReminder';
import createSendTableBookingCancelEmail from '@command/sendTableBookingCancelEmail';
import createSendTableBookingEmail from '@command/sendTableBookingEmail';
import createUnconfirmPlayer from '@command/unconfirmPlayer';
import dbMiddleware from '@middleware/dbMiddleware';
import envConfig from '@config/env';
import getOrCreateCurrentQuizDb from '@db/getOrCreateCurrentQuiz';
import isNotNullOrUndefined from '@utils/misc/isNotNullOrUndefined';
import logger from '@utils/logger';
import replyToHallihallo from '@command/replyToHallihallo';
import replyToHallochen from '@command/replyToHallochen';
import sendDebugCommand from '@command/sendDebug';
import stringify from '@utils/misc/stringify';
import {
  CALLBACK_TYPE_BENCH,
  CALLBACK_TYPE_CONFIRM,
  CALLBACK_TYPE_CONFIRM_GUESTS_0,
  CALLBACK_TYPE_CONFIRM_GUESTS_1,
  CALLBACK_TYPE_CONFIRM_GUESTS_2,
  CALLBACK_TYPE_LINEUP,
  CALLBACK_TYPE_LOTTERY,
  CALLBACK_TYPE_RESET_STATE,
  CALLBACK_TYPE_SEND_EMAIL,
  CALLBACK_TYPE_UNCONFIRM,
} from './config/constants';
import { EMOJI_CONFIRM, EMOJI_DECLINE, EMOJI_LINEUP, EMOJI_LOTTERY, EMOJI_PLAYER_BENCHED } from './config/texts';

// Types
import { MyBotContext } from './middleware/contextMiddleware';
import createSendIntroDev from './message/sendIntroDev';

const bot = new Telegraf<MyBotContext>(envConfig.botToken);

const sendAdminMessage = createSendAdminMessage(bot);

// Middlewares
bot.use(contextMiddleware);

bot.use(dbMiddleware);

// Callback Actions
bot.action(CALLBACK_TYPE_BENCH, createBenchPlayer(true));

bot.action(CALLBACK_TYPE_CONFIRM, createConfirmPlayer(true));

bot.action(CALLBACK_TYPE_CONFIRM_GUESTS_0, createConfirmGuests({ isCallback: true, numberOfInviteesFromCallback: 0 }));
bot.action(CALLBACK_TYPE_CONFIRM_GUESTS_1, createConfirmGuests({ isCallback: true, numberOfInviteesFromCallback: 1 }));
bot.action(CALLBACK_TYPE_CONFIRM_GUESTS_2, createConfirmGuests({ isCallback: true, numberOfInviteesFromCallback: 2 }));

bot.action(CALLBACK_TYPE_LINEUP, createSendLineup(true));

bot.action(CALLBACK_TYPE_LOTTERY, createLottery({ isCallback: true }));

bot.action(CALLBACK_TYPE_RESET_STATE, createResetCurrentQuizCommand(true));

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
  logger.error(err);

  void bot.launch();

  if (isNotNullOrUndefined(envConfig.adminUserId)) {
    await sendAdminMessage(`${envConfig.botName} crashed ⚰️ and restarted 🤖`);
    await sendAdminMessage(`Error was:`);
    await sendAdminMessage(fmt`${code(stringify(err as any, null, 2))}`);
  }
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

// Main
const main = async () => {
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

  void bot.launch();

  logger.info(`${envConfig.botName} is online! 🤖`, { label: 'src/index.ts' });

  await createSendIntroDev(bot)();

  if (envConfig.isProduction) {
    await sendAdminMessage(`${envConfig.botName} is online! 🤖`);
  }
};

void main();
