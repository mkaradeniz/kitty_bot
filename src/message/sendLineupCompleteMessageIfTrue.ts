import { Markup } from 'telegraf';

import { envConfig } from '@config/env';

import { getOrCreateCurrentQuizDb } from '@db/getOrCreateCurrentQuiz';

import { type MyBotContext } from '@middleware/contextMiddleware';

import { logger } from '@utils/logger/logger';
import { createSendMessage } from '@utils/message/createSendMessage';
import { getButtonFromCallbackType } from '@utils/misc/getButtonFromCallbackType';
import { getPlayersPlayingCount } from '@utils/state/getPlayersPlayingCount';

import { CallbackType, Emoji } from '@app-types/app';

export const sendLineupCompleteMessageIfTrue = async (ctx: MyBotContext) => {
  const sendMessage = createSendMessage(ctx);

  const currentQuiz = await getOrCreateCurrentQuizDb();
  const playersPlayingCount = getPlayersPlayingCount(currentQuiz);

  if (playersPlayingCount !== envConfig.maxPlayers) {
    logger.silly(`Lineup complete message not sent because lineup isn't complete.`, {
      label: 'src/message/sendLineupCompleteMessageIfTrue.ts:22',
    });

    return;
  }

  try {
    await sendMessage(
      `Our lineup for the ${currentQuiz.dateFormatted} is complete!\nSend a ${Emoji.EmailBook} or click the button below to send the mail with our table size now.`,
      {
        ...Markup.inlineKeyboard([
          Markup.button.callback(getButtonFromCallbackType(CallbackType.SendBookingEmail), CallbackType.SendBookingEmail),
        ]),
      },
    );
  } catch (err) {
    logger.error(err);
  }
};
