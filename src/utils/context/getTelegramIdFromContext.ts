import { isNotNullOrUndefined } from '@utils/misc/isNotNullOrUndefined';

import { type MyBotContext } from '../../middleware/contextMiddleware';

export const getTelegramIdFromContext = (ctx: MyBotContext) => {
  const userId = ctx.myContext.user?.id;

  if (!isNotNullOrUndefined(userId)) {
    return null;
  }

  const telegramId = BigInt(userId);

  return telegramId;
};
