// Types
import { MyBotContext } from '../../middleware/contextMiddleware';

type CreateCallbackInput = {
  ctx: MyBotContext;
  isCallback?: boolean;
};

const createCallback =
  ({ ctx, isCallback = false }: CreateCallbackInput) =>
  async () => {
    if (isCallback) {
      await ctx.answerCbQuery('');
    }
  };

export default createCallback;
