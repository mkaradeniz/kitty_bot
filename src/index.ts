require('dotenv').config();

import cron from 'node-cron';
import { Telegraf } from 'telegraf';

import contextMiddleware from './middleware/contextMiddleware';
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
import stateMiddleware, { isStateDefined, resetState } from './middleware/stateMiddleware';
import { CALLBACK_TYPE_CONFIRM, CALLBACK_TYPE_LINEUP, CALLBACK_TYPE_LOTTERY, CALLBACK_TYPE_UNCONFIRM } from './config/constants';
import { CONFIRM_EMOJI, DECLINE_EMOJI, LINEUP_EMOJI, LOTTERY_EMOJI } from './config/texts';

// Types
import { KittyBotContext } from './middleware/contextMiddleware';

const bot = new Telegraf<KittyBotContext>(envConfig.botToken);

// Middlewares
bot.use(contextMiddleware);

bot.use(dbMiddleware);

bot.use(stateMiddleware);

// Callback Actions
bot.action(CALLBACK_TYPE_CONFIRM, createConfirmPlayer(true));

bot.action(CALLBACK_TYPE_LINEUP, createSendLineup(true));

bot.action(CALLBACK_TYPE_UNCONFIRM, createUnconfirmPlayer(true));

bot.action(CALLBACK_TYPE_LOTTERY, createLottery({ isCallback: true }));

// Commands
bot.command('lineup', createSendLineup());

// Hears
bot.hears(new RegExp('([0️⃣,1️⃣,2️⃣,3️⃣,4️⃣,5️⃣,6️⃣,7️⃣,8️⃣])'), createConfirmGuests());

bot.hears(new RegExp(`(${CONFIRM_EMOJI})`), createConfirmPlayer());

bot.hears(new RegExp(`(${DECLINE_EMOJI})`), createUnconfirmPlayer());

bot.hears(new RegExp(`(${LINEUP_EMOJI})`), createSendLineup());

bot.hears(new RegExp(`(!${LOTTERY_EMOJI}${LOTTERY_EMOJI}${LOTTERY_EMOJI})`), createLottery({ isForced: true }));

bot.hears(new RegExp(`(${LOTTERY_EMOJI})`), createLottery());

bot.hears(new RegExp('hallöchen', 'i'), replyToHallochen);

bot.hears(new RegExp('hallihallo', 'i'), replyToHallihallo);

bot.hears('!final', createSendTableBookingEmail(bot));

bot.hears('!reset', resetStateCommand);

const main = async () => {
  try {
    const chatId = envConfig.pubQuizGroupId;

    await bot.launch();

    console.info('Kitty Bot is online! 🤖');

    if (!isStateDefined(chatId)) {
      resetState(chatId);
    }

    if (envConfig.isProduction) {
      bot.telegram?.sendMessage(envConfig.adminUserId, `KittyBot is online! 🤖`);

      bot.telegram?.sendMessage(envConfig.pubQuizGroupId, `KittyBot is online. Hallöchen 🤖`);
    }

    const sendEmailReminder = createSendEmailReminder(bot);
    const sendIntro = createSendIntro(bot);
    const sendReminder = createSendReminder(bot);

    cron.schedule('0 12 * * 0', () => {
      sendIntro();
    });

    cron.schedule('0 12 * * 1,2', () => {
      sendReminder();
    });

    cron.schedule('0 15 * * 2', () => {
      sendEmailReminder();
    });

    cron.schedule('0 2 * * 4', () => {
      console.log('Resetting state through cronjob.', new Date().toISOString());

      resetState(chatId);
    });

    process.once('SIGINT', () => {
      if (envConfig.isProduction) {
        bot.telegram?.sendMessage(envConfig.adminUserId, `KittyBot shutdown: SIGINT 😵`);

        bot.telegram?.sendMessage(envConfig.pubQuizGroupId, `KittyBot is offline. Goodbye cruel world 😵`);
      }

      bot.stop('SIGINT');
    });

    process.once('SIGTERM', () => {
      if (envConfig.isProduction) {
        bot.telegram?.sendMessage(envConfig.adminUserId, `KittyBot shutdown: SIGTERM 😵`);

        bot.telegram?.sendMessage(envConfig.pubQuizGroupId, `KittyBot is offline. Goodbye cruel world 😵`);
      }

      bot.stop('SIGTERM');
    });
  } catch (err) {
    console.error(err);
  }
};

main();
