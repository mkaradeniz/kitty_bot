import { logger } from '@utils/logger/logger';

import { type MyBotContext } from './contextMiddleware';

export const debugMiddleware = (_ctx: MyBotContext, next: () => Promise<void>) => {
  try {
    return next();
  } catch (err) {
    logger.error(err);

    return next();
  }
};
