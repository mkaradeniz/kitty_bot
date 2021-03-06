import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';

// Types
import { Context } from 'telegraf';
import { Message, Update, User } from 'telegraf/typings/core/types/typegram';

export interface KittyBotContext extends Context {
  myContext: {
    chatId: number;
    message?: Update.New & Update.NonChannel & Message.TextMessage;
    user?: User;
  };
}

const contextMiddleware = async (ctx: KittyBotContext, next: () => Promise<void>) => {
  if (!isNotNullOrUndefined(ctx.myContext)) {
    // @ts-expect-error
    ctx.myContext = {};
  }

  const chatId = ctx?.message?.chat.id ?? ctx.callbackQuery?.message?.chat?.id ?? undefined;

  if (!isNotNullOrUndefined(chatId)) {
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
};

export default contextMiddleware;
