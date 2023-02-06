// Types
import { KittyBotContext } from '../../middleware/contextMiddleware';

type CreateCallbackInput = {
  ctx: KittyBotContext;
  isCallback?: boolean;
};

const createCallback = ({ ctx, isCallback = false }: CreateCallbackInput) => async () => {
  if (isCallback) {
    await ctx.answerCbQuery('');
  }
};

export default createCallback;
