import { differenceBy } from 'lodash';
import pluralize from 'pluralize';

import { envConfig } from '@config/env';

import { benchPlayersDb } from '@db/benchPlayers';
import { confirmPlayersDb } from '@db/confirmPlayers';
import { getOrCreateCurrentQuizDb } from '@db/getOrCreateCurrentQuiz';
import { setLotteryDone } from '@db/setLotteryDone';

import { sendLineupCompleteMessageIfTrue } from '@message/sendLineupCompleteMessageIfTrue';
import { type MyBotContext } from '@middleware/contextMiddleware';

import { getUsernameFromContext } from '@utils/context/getUsernameFromContext';
import { getRandomBenchedGif } from '@utils/gifs/getRandomBenchedGif';
import { logger } from '@utils/logger/logger';
import { createSendGif } from '@utils/message/createSendGif';
import { createSendMessage } from '@utils/message/createSendMessage';
import { createCallback } from '@utils/misc/createCallback';
import { formatListPart } from '@utils/misc/formatListPart';
import { pickPlayersWeighted } from '@utils/misc/pickPlayersWeighted';
import { wait } from '@utils/misc/wait';
import { getPlayersBenchedCount } from '@utils/state/getPlayersBenchedCount';
import { getPlayersExternalPlayingCount } from '@utils/state/getPlayersExternalPlayingCount';
import { getPlayersPlayingCount } from '@utils/state/getPlayersPlayingCount';

import { Emoji } from '@app-types/app';

import { createSendLineup } from './sendLineup';

// @ts-expect-error | TypeScript doesn't have types for this yet.
const listFormatter = new Intl.ListFormat('en');

type CreateLotteryInput = {
  isCallback?: boolean;
  isForced?: boolean;
};

export const createLottery =
  ({ isCallback = false, isForced = false }: CreateLotteryInput = {}) =>
  async (ctx: MyBotContext) => {
    const callback = createCallback({ ctx, isCallback });

    try {
      const sendGif = createSendGif(ctx);
      const sendMessage = createSendMessage(ctx);

      const currentQuiz = await getOrCreateCurrentQuizDb();

      const { usernameInBold } = getUsernameFromContext(ctx);

      const playersPlayingCount = getPlayersPlayingCount(currentQuiz);
      const playersBenchedCount = getPlayersBenchedCount(currentQuiz);

      if (currentQuiz.isLotteryDone && !isForced) {
        await sendMessage(`${usernameInBold}, we already had the lottery. Isn't one enough for this week?`);

        return callback();
      }

      if (
        (!isForced && playersPlayingCount <= envConfig.maxPlayers) ||
        (isForced && playersPlayingCount + playersBenchedCount <= envConfig.maxPlayers)
      ) {
        if (playersPlayingCount > 0 || playersPlayingCount === envConfig.maxPlayers) {
          if (playersPlayingCount < envConfig.maxPlayers) {
            await sendMessage(`Now that is just cruel, ${usernameInBold}. We're not even full and you want to bench someone?`);
          }

          if (playersPlayingCount === envConfig.maxPlayers) {
            await sendMessage(
              `Now that is just cruel, ${usernameInBold}. We have exactly <b>${envConfig.maxPlayers}</b> ${pluralize(
                'players',
                envConfig.maxPlayers,
              )} and you want to bench someone?`,
            );
          }

          await sendGif(
            'https://media1.giphy.com/media/vX9WcCiWwUF7G/giphy.gif?cid=ecf05e478ab7aldlabx5by30fqrm9zim2atg2l2lnkwjtfpw&rid=giphy.gif&ct=g',
          );
        }

        return callback();
      }

      const playersExternalPlayingCount = getPlayersExternalPlayingCount(currentQuiz);

      if (playersExternalPlayingCount > 0) {
        await sendMessage(
          `We have <b>${playersExternalPlayingCount}</b> ${pluralize(
            'guest',
            playersExternalPlayingCount,
          )}, we should uninvite them before benching ${Emoji.Team}s.`,
        );

        return callback();
      }

      const players = currentQuiz.players;
      const playersBenched = currentQuiz.playersBenched;
      const allPlayers = [...players, ...playersBenched];

      const pickedPlayers = pickPlayersWeighted(allPlayers, envConfig.maxPlayers);
      const nextPlayersBenched = differenceBy(allPlayers, pickedPlayers, player => player.id);

      await confirmPlayersDb(pickedPlayers.map(pickedPlayer => pickedPlayer.telegramId));
      await benchPlayersDb(nextPlayersBenched.map(pickedPlayer => pickedPlayer.telegramId));

      if (envConfig.isProduction) {
        await sendGif(
          'https://media3.giphy.com/media/hzLgfw7C4sBwqSZ63I/giphy.gif?cid=790b761153a265113b8a7ced0cd24e76fd2c8fd60a44da44&rid=giphy.gif&ct=g',
        );

        await wait(1000);

        await sendMessage(`3...`);
        await wait(1000);

        await sendMessage(`2...`);
        await wait(1000);

        await sendMessage(`1...`);
        await wait(1000);
      }

      for (const pickedPlayer of pickedPlayers) {
        await sendMessage(`<b>${pickedPlayer.firstName}</b>, you're in! ${Emoji.Positive}`);

        await wait(1000);
      }

      const nextPlayersBenchedList = nextPlayersBenched
        .slice()
        .sort((a, b) => a.firstName.localeCompare(b.firstName))
        .map(player => `${player.firstName}`);

      const nextPlayersBenchedText = listFormatter.formatToParts(nextPlayersBenchedList).map(formatListPart).join('');

      if (envConfig.isProduction) {
        const sentMessage = await sendMessage(`I'm so sorry ${nextPlayersBenchedText}. ${Emoji.Negative}`);

        await sendGif(getRandomBenchedGif(), sentMessage?.message_id);
      }

      await createSendLineup(isCallback)(ctx);

      await sendLineupCompleteMessageIfTrue(ctx);

      await setLotteryDone();

      return callback();
    } catch (err) {
      logger.error(err);

      return callback();
    }
  };
