import envConfig from '../../config/env';
import getChatIdFromContext from '../context/getChatIdFromContext';
import logger from '../logger';

// Types
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import { MyBotContext } from '../../middleware/contextMiddleware';

const DEFAULT_MESSAGE_OPTIONS: ExtraReplyMessage = { parse_mode: 'HTML' };

const createSendMessage =
  (ctx: MyBotContext) =>
  async (message: string, additionalMessageOptions: ExtraReplyMessage = {}) => {
    const chatId = getChatIdFromContext(ctx);

    if (chatId !== envConfig.pubquizChatId) {
      logger.silly(`Message was being sent to an unknown group. Ignoring.`, { label: 'src/message/createSendMessage.ts:17' });

      return;
    }

    const sentMessage = await ctx.telegram.sendMessage(chatId, message, { ...DEFAULT_MESSAGE_OPTIONS, ...additionalMessageOptions });

    return sentMessage;
  };

export default createSendMessage;
