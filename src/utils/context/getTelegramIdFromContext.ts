import isNotNullOrUndefined from '@utils/misc/isNotNullOrUndefined';

// Types
import { MyBotContext } from '@middleware/contextMiddleware';

const getTelegramIdFromContext = (ctx: MyBotContext) => {
  const userId = ctx.myContext.user?.id;

  if (!isNotNullOrUndefined(userId)) {
    return null;
  }

  const telegramId = BigInt(userId);

  return telegramId;
};

export default getTelegramIdFromContext;
