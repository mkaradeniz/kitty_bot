import pluralize from 'pluralize';
import { Markup } from 'telegraf';

import envConfig from '../config/env';
import { CALLBACK_TYPE_CONFIRM, CALLBACK_TYPE_LINEUP, CALLBACK_TYPE_UNCONFIRM } from '../config/constants';
import { CONFIRM_EMOJI, DECLINE_EMOJI, LINEUP_EMOJI, TUTORIAL } from '../config/texts';
import { getPlayerCount, getPlayerOutCount, isEmailSent } from '../middleware/stateMiddleware';

// Types
import { KittyBotContext } from '../middleware/contextMiddleware';
import { Telegraf } from 'telegraf';

const createSendReminder = (bot: Telegraf<KittyBotContext>) => async () => {
  try {
    const chatId = envConfig.pubQuizGroupId;

    if (isEmailSent(chatId)) {
      return;
    }

    const playerCount = getPlayerCount(chatId);

    if (playerCount < envConfig.maxPlayers) {
      const playerOutCount = getPlayerOutCount(chatId);
      const chatMembersCount = await bot.telegram?.getChatMembersCount(chatId);
      const notRespondedCount = chatMembersCount - 1 - playerCount - playerOutCount;
      const emptySpots = envConfig.maxPlayers - playerCount;

      const notRespondedMessage =
        notRespondedCount > 0 ? `<b>${notRespondedCount}</b> ${pluralize('player', notRespondedCount)} did not respond yet.\n\n` : '';

      await bot.telegram?.sendMessage(
        chatId,
        `🍻 REMINDER: We still have <b>${emptySpots}</b> empty ${pluralize('spot', emptySpots)}! 🍻\n\n${notRespondedMessage}${TUTORIAL}`,
        {
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([
            Markup.button.callback(CONFIRM_EMOJI, CALLBACK_TYPE_CONFIRM),
            Markup.button.callback(DECLINE_EMOJI, CALLBACK_TYPE_UNCONFIRM),
            Markup.button.callback(LINEUP_EMOJI, CALLBACK_TYPE_LINEUP),
          ]),
        },
      );
    }
  } catch (err) {
    console.error(err);
  }
};

export default createSendReminder;
