import { Markup } from 'telegraf';

import createSendMessage from '../utils/message/createSendMessage';
import envConfig from '../config/env';
import getButtonFromCallbackType from '../utils/misc/getButtonFromCallbackType';
import getOrCreateCurrentQuizDb from '../db/getOrCreateCurrentQuiz';
import getPlayersPlayingCount from '../utils/state/getPlayersPlayingCount';
import logger from '../utils/logger';

// Types
import { CallbackType, Emoji } from '../types';
import { MyBotContext } from '../middleware/contextMiddleware';

const sendLineupCompleteMessageIfTrue = async (ctx: MyBotContext) => {
  const sendMessage = createSendMessage(ctx);

  const currentQuiz = await getOrCreateCurrentQuizDb();
  const playersPlayingCount = getPlayersPlayingCount(currentQuiz);

  if (playersPlayingCount !== envConfig.maxPlayers) {
    logger.silly(`Lineup complete message not sent because lineup isn't complete.`, {
      label: 'src/message/sendLineupCompleteMessageIfTrue.ts',
    });

    return;
  }

  try {
    await sendMessage(
      `Our lineup for the ${currentQuiz.dateFormatted} is complete!
  Send a ${Emoji.EmailBook} or click the button below to send the mail with our table size now.`,
      { ...Markup.inlineKeyboard([Markup.button.callback(getButtonFromCallbackType(CallbackType.Lottery), CallbackType.Lottery)]) },
    );
  } catch (err) {
    logger.error(err);
  }
};

export default sendLineupCompleteMessageIfTrue;
