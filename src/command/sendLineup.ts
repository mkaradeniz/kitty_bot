import { Markup } from 'telegraf';

import createCallback from '../utils/misc/createCallback';
import createSendMessage from '../utils/message/createSendMessage';
import getLineup from '../utils/state/getLineup';
import getOrCreateCurrentQuizDb from '../db/getOrCreateCurrentQuiz';
import getPlayersBenchedCount from '../utils/state/getPlayersBenchedCount';
import getPlayersOutCount from '../utils/state/getPlayersOutCount';
import getPlayersPlayingCount from '../utils/state/getPlayersPlayingCount';
import sendOverbookedWarningIfTrue from '../message/sendOverbookedWarningIfTrue';
import { CALLBACK_TYPE_BENCH } from '../config/constants';
import { EMOJI_PLAYER_BENCHED } from '../config/texts';

// Types
import { MyBotContext } from '../middleware/contextMiddleware';

const createSendLineup =
  (isCallback = false) =>
  async (ctx: MyBotContext) => {
    const callback = createCallback({ ctx, isCallback });

    try {
      const sendMessage = createSendMessage(ctx);

      const currentQuiz = await getOrCreateCurrentQuizDb();

      const playersPlayingCount = getPlayersPlayingCount(currentQuiz);
      const playersOutCount = getPlayersOutCount(currentQuiz);
      const playersBenchedCount = getPlayersBenchedCount(currentQuiz);

      if (playersPlayingCount + playersOutCount + playersBenchedCount === 0) {
        await sendMessage(`We have no confirmed players for the <b>${currentQuiz.dateFormatted}</b> at the moment.`);

        return callback();
      }

      const lineup = getLineup(currentQuiz);

      const benchCtaButton =
        playersBenchedCount > 0 ? { ...Markup.inlineKeyboard([Markup.button.callback(EMOJI_PLAYER_BENCHED, CALLBACK_TYPE_BENCH)]) } : {};

      await sendMessage(lineup, { ...benchCtaButton });

      await sendOverbookedWarningIfTrue(ctx);

      return callback();
    } catch (err) {
      console.error(err);

      return callback();
    }
  };

export default createSendLineup;
