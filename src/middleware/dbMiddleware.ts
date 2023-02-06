import createPlayer from '../db/createPlayer';
import doesPlayerExist from '../db/doesPlayerExist';
import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';

// Types
import { KittyBotContext } from './contextMiddleware';

const dbMiddleware = async (ctx: KittyBotContext, next: () => Promise<void>) => {
  try {
    const chatId = ctx?.message?.chat.id ?? ctx.callbackQuery?.message?.chat?.id ?? undefined;

    if (!isNotNullOrUndefined(chatId)) {
      return next();
    }

    const userId = ctx?.message?.from?.id ?? ctx.callbackQuery?.from?.id ?? undefined;

    if (!isNotNullOrUndefined(userId)) {
      return next();
    }

    if (await doesPlayerExist(userId)) {
      return next();
    }

    await createPlayer(userId);

    return next();
  } catch (err) {
    console.error(err);

    return next();
  }
};

export default dbMiddleware;
