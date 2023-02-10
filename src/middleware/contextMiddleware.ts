import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';
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
      console.warn(`Couldn't get \`userId\``, stringify(ctx.message, null, 2));

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
    console.error(err);

    return next();
  }
};

export default contextMiddleware;
