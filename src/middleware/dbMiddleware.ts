import createPlayer from '../db/createPlayer';
import doesPlayerExist from '../db/doesPlayerExist';
import getOrCreateCurrentQuizDb from '../db/getOrCreateCurrentQuiz';
import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';

// Types
import { MyBotContext } from './contextMiddleware';

const dbMiddleware = async (ctx: MyBotContext, next: () => Promise<void>) => {
  try {
    const chatId = ctx?.message?.chat.id ?? ctx.callbackQuery?.message?.chat?.id ?? undefined;

    if (!isNotNullOrUndefined(chatId)) {
      return next();
    }

    await getOrCreateCurrentQuizDb();

    const userId = ctx?.message?.from?.id ?? ctx.callbackQuery?.from?.id ?? undefined;
    const userFirstName = ctx?.message?.from?.first_name ?? ctx.callbackQuery?.from?.first_name ?? '👻';

    if (!isNotNullOrUndefined(userId)) {
      return next();
    }

    if (await doesPlayerExist(userId)) {
      return next();
    }

    await createPlayer({ firstName: userFirstName, telegramId: userId });

    return next();
  } catch (err) {
    console.error(err);

    return next();
  }
};

export default dbMiddleware;
