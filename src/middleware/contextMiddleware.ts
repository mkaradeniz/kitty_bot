import { type Context } from 'telegraf';
import { type Message, type Update, type User } from 'telegraf/typings/core/types/typegram';

import { logger } from '@utils/logger/logger';
import { isNotNullOrUndefined } from '@utils/misc/isNotNullOrUndefined';
import { stringify } from '@utils/misc/stringify';

export interface MyBotContext extends Context {
  myContext: {
    chatId: number;
    message?: Update.New & Update.NonChannel & Message.TextMessage;
    user?: User;
  };
}

export const contextMiddleware = (ctx: MyBotContext, next: () => Promise<void>) => {
  try {
    if (!isNotNullOrUndefined(ctx.myContext)) {
      // @ts-expect-error
      ctx.myContext = {};
    }

    const message = ctx?.message ?? ctx.callbackQuery?.message;

    if (!isNotNullOrUndefined(message) || Object.keys(message).length === 0) {
      logger.silly(`Message was \`undefined\` or empty.`, { label: 'src/middleware/contextMiddleware.ts:27' });

      return;
    }

    const chatId = message.chat.id;

    if (!isNotNullOrUndefined(chatId)) {
      logger.warn(`Couldn't get \`chatId\`: ${stringify(message, null, 2)}`, { label: 'src/middleware/contextMiddleware.ts:35' });

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
