import { resetState } from '../middleware/stateMiddleware';

// Types
import { KittyBotContext } from '../middleware/contextMiddleware';

const resetStateCommand = async (ctx: KittyBotContext) => {
  const { chatId } = ctx.myContext;

  resetState(chatId);

  await ctx.telegram.sendMessage(chatId, `State was reset.`);
};

export default resetStateCommand;
