import { code, fmt } from 'telegraf/format';

import createSendAdminMessage from '../utils/message/createSendAdminMessage';
import createSendGif from '../utils/message/createSendGif';
import envConfig from '../config/env';
import getOrCreateCurrentQuizDb from '../db/getOrCreateCurrentQuiz';
import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';
import logger from '../utils/logger';
import stringify from '../utils/misc/stringify';

// Types
import { MyBotContext } from '../middleware/contextMiddleware';

const sendDebugCommand = async (ctx: MyBotContext) => {
  // ! This only works if we have the `adminUserId` defined in the ENVs.
  if (!isNotNullOrUndefined(envConfig.adminUserId)) {
    return;
  }

  try {
    const sendAdminMessage = createSendAdminMessage(ctx);
    const sendGif = createSendGif(ctx);

    const currentQuiz = await getOrCreateCurrentQuizDb();

    await sendAdminMessage(
      fmt`${code(stringify(currentQuiz, (_key, value) => (typeof value === 'bigint' ? value.toString() : value), 2))}`,
    );

    await sendGif(
      'https://media2.giphy.com/media/GCvktC0KFy9l6/giphy.gif?cid=ecf05e47ni7jqjdft2xdhzu6cjxh8mxbn6arwif2soqjwohj&rid=giphy.gif&ct=g',
      ctx.message?.message_id,
    );
  } catch (err) {
    logger.error(err);
  }
};

export default sendDebugCommand;
