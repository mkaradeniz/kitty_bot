import envConfig from '../../config/env';
import isNotNullOrUndefined from '../misc/isNotNullOrUndefined';

// Types
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import { FmtString } from 'telegraf/format';
import { MyBotContext } from '../../middleware/contextMiddleware';
import { Telegraf } from 'telegraf';

const DEFAULT_MESSAGE_OPTIONS: ExtraReplyMessage = { parse_mode: 'HTML' };

// ! This only works if we have the `adminUserId` defined in the ENVs.
const createSendAdminMessage =
  (bot: Telegraf<any> | MyBotContext) =>
  async (message: FmtString | string, additionalMessageOptions: ExtraReplyMessage = {}) => {
    const chatId = envConfig.adminUserId;

    if (!isNotNullOrUndefined(chatId)) {
      return null;
    }

    const sentMessage = await bot.telegram.sendMessage(chatId, message, { ...DEFAULT_MESSAGE_OPTIONS, ...additionalMessageOptions });

    return sentMessage;
  };

export default createSendAdminMessage;
