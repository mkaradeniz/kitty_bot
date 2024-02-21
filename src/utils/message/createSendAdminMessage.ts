import { type Telegraf } from 'telegraf';
import { type FmtString } from 'telegraf/format';
import { type ExtraReplyMessage } from 'telegraf/typings/telegram-types';

import { envConfig } from '@config/env';

import { isNotNullOrUndefined } from '@utils/misc/isNotNullOrUndefined';

import { type MyBotContext } from '../../middleware/contextMiddleware';

const DEFAULT_MESSAGE_OPTIONS: ExtraReplyMessage = { parse_mode: 'HTML' };

// ! This only works if we have the `adminUserId` defined in the ENVs.
export const createSendAdminMessage =
  (bot: Telegraf<any> | MyBotContext) =>
  async (message: FmtString | string, additionalMessageOptions: ExtraReplyMessage = {}) => {
    const chatId = envConfig.adminUserId;

    if (!isNotNullOrUndefined(chatId)) {
      return null;
    }

    const sentMessage = await bot.telegram.sendMessage(chatId, message, { ...DEFAULT_MESSAGE_OPTIONS, ...additionalMessageOptions });

    return sentMessage;
  };
