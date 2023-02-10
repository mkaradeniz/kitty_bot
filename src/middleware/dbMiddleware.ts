import createPlayer from '../db/createPlayer';
import doesPlayerExist from '../db/doesPlayerExist';
import getOrCreateCurrentQuizDb from '../db/getOrCreateCurrentQuiz';
import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';
import stringify from '../utils/misc/stringify';

// Types
import { MyBotContext } from './contextMiddleware';

const dbMiddleware = async (ctx: MyBotContext, next: () => Promise<void>) => {
  try {
    const chatId = ctx?.message?.chat.id ?? ctx.callbackQuery?.message?.chat?.id ?? undefined;

    if (!isNotNullOrUndefined(chatId)) {
      console.warn(`Couldn't get \`chatId\``, stringify(ctx.message, null, 2));

      return next();
    }

    await getOrCreateCurrentQuizDb();

    const userId = ctx?.message?.from?.id ?? ctx.callbackQuery?.from?.id ?? undefined;
    const userFirstName = ctx?.message?.from?.first_name ?? ctx.callbackQuery?.from?.first_name ?? '👻';

    if (!isNotNullOrUndefined(userId)) {
      console.warn(`Couldn't get \`userId\``, stringify(ctx.message, null, 2));

      return next();
    }

    if (await doesPlayerExist(userId)) {
      return next();
    }

    await createPlayer({ firstName: userFirstName, telegramId: userId });

    console.info(`Created new player: \`firstName\`: ${userFirstName}, \`telegramId\`: ${userId}.`);

    return next();
  } catch (err) {
    console.error(err);

    return next();
  }
};

export default dbMiddleware;
