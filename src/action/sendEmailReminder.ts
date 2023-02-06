import envConfig from '../config/env';
import { isEmailSent } from '../middleware/stateMiddleware';

// Types
import { KittyBotContext } from '../middleware/contextMiddleware';
import { Telegraf } from 'telegraf';

const createSendEmailReminder = (bot: Telegraf<KittyBotContext>) => async () => {
  try {
    const chatId = envConfig.pubQuizGroupId;

    if (isEmailSent(chatId)) {
      return;
    }

    await bot.telegram?.sendMessage(
      chatId,
      `⚠️ We still haven't sent Scott the mail with our lineup. Write <code>!final</code> to send it now. ⚠️`,
      { parse_mode: 'HTML' },
    );
  } catch (err) {
    console.error(err);
  }
};

export default createSendEmailReminder;
