import createPlayer from '@db/createPlayer';
import doesPlayerExist from '@db/doesPlayerExist';
import getOrCreateCurrentQuizDb from '@db/getOrCreateCurrentQuiz';
import isNotNullOrUndefined from '@utils/misc/isNotNullOrUndefined';
import logger from '@utils/logger';
import stringify from '@utils/misc/stringify';

// Types
import { MyBotContext } from './contextMiddleware';

const dbMiddleware = async (ctx: MyBotContext, next: () => Promise<void>) => {
  try {
    const chatId = ctx?.message?.chat.id ?? ctx.callbackQuery?.message?.chat?.id ?? undefined;

    if (!isNotNullOrUndefined(chatId)) {
      logger.warn(`Couldn't get \`chatId\``, stringify(ctx.message, null, 2), { label: 'src/middleware/dbMiddleware.ts' });

      return next();
    }

    await getOrCreateCurrentQuizDb();

    const userId = ctx?.message?.from?.id ?? ctx.callbackQuery?.from?.id ?? undefined;
    const userFirstName = ctx?.message?.from?.first_name ?? ctx.callbackQuery?.from?.first_name ?? '👻';

    if (!isNotNullOrUndefined(userId)) {
      logger.warn(`Couldn't get \`userId\``, stringify(ctx.message, null, 2), { label: 'src/middleware/dbMiddleware.ts' });

      return next();
    }

    if (await doesPlayerExist(userId)) {
      return next();
    }

    await createPlayer({ firstName: userFirstName, telegramId: userId });

    logger.info(`Created new player: \`firstName\`: ${userFirstName}, \`telegramId\`: ${userId}.`, {
      label: 'src/middleware/dbMiddleware.ts',
    });

    return next();
  } catch (err) {
    logger.error(err);

    return next();
  }
};

export default dbMiddleware;
