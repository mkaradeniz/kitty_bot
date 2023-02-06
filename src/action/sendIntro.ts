import { Markup } from 'telegraf';

import envConfig from '../config/env';
import { CALLBACK_TYPE_CONFIRM, CALLBACK_TYPE_LINEUP, CALLBACK_TYPE_UNCONFIRM } from '../config/constants';
import { CONFIRM_EMOJI, DECLINE_EMOJI, LINEUP_EMOJI, TUTORIAL } from '../config/texts';
import { getQuizDate } from '../middleware/stateMiddleware';

// Types
import { KittyBotContext } from '../middleware/contextMiddleware';
import { Telegraf } from 'telegraf';

const createSendIntro = (bot: Telegraf<KittyBotContext>) => async () => {
  try {
    const chatId = envConfig.pubQuizGroupId;
    const quizDate = getQuizDate(chatId);

    await bot.telegram?.sendMessage(chatId, `🍻 QUIZZY TIME 🍻\n\nWho's in for quizzy on the <b>${quizDate}</B>?\n\n${TUTORIAL}`, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        Markup.button.callback(CONFIRM_EMOJI, CALLBACK_TYPE_CONFIRM),
        Markup.button.callback(DECLINE_EMOJI, CALLBACK_TYPE_UNCONFIRM),
        Markup.button.callback(LINEUP_EMOJI, CALLBACK_TYPE_LINEUP),
      ]),
    });
  } catch (err) {
    console.error(err);
  }
};

export default createSendIntro;
