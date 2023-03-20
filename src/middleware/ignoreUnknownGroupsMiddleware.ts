import envConfig from '../config/env';
import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';
import logger from '../utils/logger';

// Types
import { MyBotContext } from './contextMiddleware';

const ignoreUnknownGroupsMiddleware = (ctx: MyBotContext, next: () => Promise<void>) => {
  try {
    // @ts-expect-error
    const chatId = ctx?.message?.chat.id ?? ctx?.update?.callback_query?.message?.chat?.id ?? undefined;

    if (!isNotNullOrUndefined(chatId)) {
      return;
    }

    if (chatId !== envConfig.pubquizChatId) {
      logger.silly(`Message came from an unknown group. Ignoring.`, { label: 'src/middleware/ignoreUnknownGroupsMiddleware.ts:18' });

      return;
    }

    return next();
  } catch (err) {
    logger.error(err);

    return next();
  }
};

export default ignoreUnknownGroupsMiddleware;
