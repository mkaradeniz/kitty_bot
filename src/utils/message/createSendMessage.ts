import getChatIdFromContext from '../context/getChatIdFromContext';

// Types
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import { MyBotContext } from '../../middleware/contextMiddleware';

const DEFAULT_MESSAGE_OPTIONS: ExtraReplyMessage = { parse_mode: 'HTML' };

const createSendMessage =
  (ctx: MyBotContext) =>
  async (message: string, additionalMessageOptions: ExtraReplyMessage = {}) => {
    const chatId = getChatIdFromContext(ctx);

    const sentMessage = await ctx.telegram.sendMessage(chatId, message, { ...DEFAULT_MESSAGE_OPTIONS, ...additionalMessageOptions });

    return sentMessage;
  };

export default createSendMessage;
