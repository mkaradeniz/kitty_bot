import stringify from 'safe-json-stringify';
import { fmt, code } from 'telegraf/format';

import envConfig from '../config/env';
import { getState } from '../middleware/stateMiddleware';

// Types
import { KittyBotContext } from '../middleware/contextMiddleware';

const sendStateCommand = async (ctx: KittyBotContext) => {
  try {
    const { chatId } = ctx.myContext;

    const state = getState(chatId);

    await ctx.telegram.sendMessage(envConfig.adminUserId, fmt`${code(stringify(state, null, 2))}`);

    await ctx.telegram.sendAnimation(
      chatId,
      'https://media2.giphy.com/media/GCvktC0KFy9l6/giphy.gif?cid=ecf05e47ni7jqjdft2xdhzu6cjxh8mxbn6arwif2soqjwohj&rid=giphy.gif&ct=g',
    );
  } catch (err) {
    console.error(err);
  }
};

export default sendStateCommand;
