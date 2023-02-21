import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';
import logger from '../utils/logger';
import stringify from '../utils/misc/stringify';

// Types
import { Context } from 'telegraf';
import { Message, Update, User } from 'telegraf/typings/core/types/typegram';

export interface MyBotContext extends Context {
  myContext: {
    chatId: number;
    message?: Update.New & Update.NonChannel & Message.TextMessage;
    user?: User;
  };
}

const contextMiddleware = (ctx: MyBotContext, next: () => Promise<void>) => {
  try {
    if (!isNotNullOrUndefined(ctx.myContext)) {
      // @ts-expect-error
      ctx.myContext = {};
    }

    const chatId = ctx?.message?.chat.id ?? ctx.callbackQuery?.message?.chat?.id ?? undefined;

    if (!isNotNullOrUndefined(chatId)) {
      logger.warn(`Couldn't get \`chatId\`: ${stringify(ctx.message, null, 2)}`, { label: 'src/middleware/contextMiddleware.ts:27' });

      return;
    }

    const user = ctx?.message?.from ?? ctx.callbackQuery?.from ?? undefined;

    ctx.myContext.chatId = chatId;
    ctx.myContext.user = user;

    if (isNotNullOrUndefined(ctx.message)) {
      if ('text' in ctx.message) {
        const message = ctx.message;

        ctx.myContext.message = message;
      }
    }

    return next();
  } catch (err) {
    logger.error(err);

    return next();
  }
};

export default contextMiddleware;
