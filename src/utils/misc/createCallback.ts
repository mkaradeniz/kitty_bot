import { type MyBotContext } from '../../middleware/contextMiddleware';

type CreateCallbackInput = {
  ctx: MyBotContext;
  isCallback?: boolean;
};

export const createCallback =
  ({ ctx, isCallback = false }: CreateCallbackInput) =>
  async () => {
    if (isCallback) {
      await ctx.answerCbQuery('');
    }
  };
