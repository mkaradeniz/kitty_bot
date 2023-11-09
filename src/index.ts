require('dotenv').config();

(BigInt.prototype as any)['toJSON'] = function () {
  return this.toString();
};

import cron from 'node-cron';
import { Telegraf } from 'telegraf';
import { code, fmt } from 'telegraf/format';

import calculateLastQuizsBenchedPlayersBenchCount from './db/calculateLastQuizsBenchedPlayersBenchCount';
import contextMiddleware from './middleware/contextMiddleware';
import createBenchPlayer from './command/benchPlayer';
import createConfirmGuests from './command/confirmGuests';
import createConfirmPlayer from './command/confirmPlayer';
import createLottery from './command/lottery';
import createResetCurrentQuizCommand from './command/resetState';
import createSendAdminMessage from './utils/message/createSendAdminMessage';
import createSendEmailReminder from './message/sendEmailReminder';
import createSendIntro from './message/sendIntro';
import createSendIntroDev from './message/sendIntroDev';
import createSendLineup from './command/sendLineup';
import createSendReminder from './message/sendReminder';
import createSendTableBookingCancelEmail from './command/sendTableBookingCancelEmail';
import createSendTableBookingEmail from './command/sendTableBookingEmail';
import createUnconfirmPlayer from './command/unconfirmPlayer';
import dbMiddleware from './middleware/dbMiddleware';
import envConfig from './config/env';
import getOrCreateCurrentQuizDb from './db/getOrCreateCurrentQuiz';
import ignoreUnknownGroupsMiddleware from './middleware/ignoreUnknownGroupsMiddleware';
import isNotNullOrUndefined from './utils/misc/isNotNullOrUndefined';
import logger from './utils/logger';
import replyToHallihallo from './command/replyToHallihallo';
import replyToHallochen from './command/replyToHallochen';
import sendDebugCommand from './command/sendDebug';
import stringify from './utils/misc/stringify';

// Types
import { CallbackType, Emoji } from './types';
import { MyBotContext } from './middleware/contextMiddleware';

const bot = new Telegraf<MyBotContext>(envConfig.botToken);

const sendAdminMessage = createSendAdminMessage(bot);

// Middlewares
bot.use(ignoreUnknownGroupsMiddleware);

bot.use(contextMiddleware);

bot.use(dbMiddleware);

// Callback Actions
bot.action(CallbackType.Bench, createBenchPlayer(true));

bot.action(CallbackType.Confirm, createConfirmPlayer(true));

bot.action(CallbackType.ConfirmGuests0, createConfirmGuests({ isCallback: true, numberOfInviteesFromCallback: 0 }));
bot.action(CallbackType.ConfirmGuests1, createConfirmGuests({ isCallback: true, numberOfInviteesFromCallback: 1 }));
bot.action(CallbackType.ConfirmGuests2, createConfirmGuests({ isCallback: true, numberOfInviteesFromCallback: 2 }));

bot.action(CallbackType.Lineup, createSendLineup(true));

bot.action(CallbackType.Lottery, createLottery({ isCallback: true }));

bot.action(CallbackType.ResetState, createResetCurrentQuizCommand(true));

bot.action(CallbackType.SendBookingEmail, createSendTableBookingEmail(true));
bot.action(CallbackType.SendCancelEmail, createSendTableBookingCancelEmail(true));

bot.action(CallbackType.Unconfirm, createUnconfirmPlayer(true));

// Hears
bot.hears(new RegExp('([0️⃣,1️⃣,2️⃣,3️⃣,4️⃣,5️⃣,6️⃣,7️⃣,8️⃣])'), createConfirmGuests());

bot.hears(new RegExp(`(${Emoji.PlayerBenched})`), createBenchPlayer());

bot.hears(new RegExp(`(${Emoji.Confirm})`), createConfirmPlayer());

bot.hears(new RegExp(`(${Emoji.Decline})`), createUnconfirmPlayer());

bot.hears(new RegExp(`(${Emoji.Lineup})`), createSendLineup());

bot.hears(new RegExp(`(!${Emoji.Lottery}${Emoji.Lottery}${Emoji.Lottery})`), createLottery({ isForced: true }));

bot.hears(new RegExp(`(${Emoji.Lottery})`), createLottery());

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

  // At 12:00 on Saturday.
  cron.schedule('0 12 * * 6', () => {
    void sendIntro();
  });

  // At 12:00 on Sunday.
  cron.schedule('0 12 * * 6', () => {
    void sendReminder();
  });

  // At minute 0 past every hour from 15 through 18 on Tuesday.
  cron.schedule('0 14-19 * * 0', () => {
    void sendEmailReminder();
  });

  // At 02:00 on Thursday.
  cron.schedule('0 2 * * 4', async () => {
    // If we get the current quiz on a Thursday, we will automatically create the new one.
    await getOrCreateCurrentQuizDb();

    await calculateLastQuizsBenchedPlayersBenchCount();
  });

  void bot.launch();

  logger.info(`${envConfig.botName} is online! 🤖`, { label: 'src/index.ts:157' });

  await createSendIntroDev(bot)();

  if (envConfig.isProduction) {
    await sendAdminMessage(`${envConfig.botName} is online! 🤖`);
  }
};

void main();
