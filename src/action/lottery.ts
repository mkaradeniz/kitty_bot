import pluralize from 'pluralize';
import { differenceBy } from 'lodash';
import { getISODay } from 'date-fns';

import createCallback from '../utils/misc/createCallback';
import createSendLineup from './sendLineup';
import envConfig from '../config/env';
import formatListPart from '../utils/misc/formatListPart';
import getRandomBenchedGif from '../utils/gifs/getRandomBenchedGif';
import getUsersWithCountBenched from '../db/getUsersWithCountBenched';
import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';
import pickPlayersWeighted from '../utils/misc/pickPlayersWeighted';
import playerBenchCountIncrement from '../db/playerBenchCountIncrement';
import wait from '../utils/misc/wait';
import { NEGATIVE_EMOJI, POSITIVE_EMOJI } from '../config/texts';
import {
  getPlayerBenchedCount,
  getPlayerCount,
  getPlayerExternalCount,
  getPlayers,
  getPlayersBenched,
  setPlayers,
  setPlayersBenched,
} from '../middleware/stateMiddleware';

// Types
import { DayOfWeek } from '../types';
import { KittyBotContext } from '../middleware/contextMiddleware';

// @ts-expect-error | TypeScript doesn't have types for this yet.
const listFormatter = new Intl.ListFormat('en');

type CreateLotteryInput = {
  isCallback?: boolean;
  isForced?: boolean;
};

const createLottery = ({ isCallback = false, isForced = false }: CreateLotteryInput = {}) => async (ctx: KittyBotContext) => {
  const callback = createCallback({ ctx, isCallback });

  try {
    const dayOfWeek = getISODay(new Date());

    if (envConfig.isProduction && dayOfWeek !== DayOfWeek.Sunday && dayOfWeek !== DayOfWeek.Monday && dayOfWeek !== DayOfWeek.Tuesday) {
      return callback();
    }

    const { chatId, user } = ctx.myContext;

    const userId = ctx.myContext.user?.id;

    if (!isNotNullOrUndefined(chatId) || !isNotNullOrUndefined(user) || !isNotNullOrUndefined(userId)) {
      return callback();
    }

    const playerCount = getPlayerCount(chatId);
    const playerBenchedCount = getPlayerBenchedCount(chatId);

    if ((!isForced && playerCount <= envConfig.maxPlayers) || (isForced && playerCount + playerBenchedCount <= envConfig.maxPlayers)) {
      if (playerCount > 0 || playerCount === envConfig.maxPlayers) {
        if (playerCount < envConfig.maxPlayers) {
          await ctx.telegram.sendMessage(
            chatId,
            `Now that is just cruel, <b>${user.first_name}</b>. We're not even full and you want to bench someone?`,
            { parse_mode: 'HTML' },
          );
        }

        if (playerCount === envConfig.maxPlayers) {
          await ctx.telegram.sendMessage(
            chatId,
            `Now that is just cruel, <b>${user.first_name}</b>. We have exactly <b>${envConfig.maxPlayers}</b> ${pluralize(
              'players',
              envConfig.maxPlayers,
            )} and you want to bench someone?`,
            { parse_mode: 'HTML' },
          );
        }

        await ctx.telegram.sendAnimation(
          chatId,
          'https://media1.giphy.com/media/vX9WcCiWwUF7G/giphy.gif?cid=ecf05e478ab7aldlabx5by30fqrm9zim2atg2l2lnkwjtfpw&rid=giphy.gif&ct=g',
        );
      }

      return callback();
    }

    const playersExternalCount = getPlayerExternalCount(chatId);

    if (playersExternalCount > 0) {
      await ctx.telegram.sendMessage(
        chatId,
        `We have <b>${playersExternalCount}</b> ${pluralize(
          'guest',
          playersExternalCount,
        )}, we should uninvite them before benching pickles.`,
        {
          parse_mode: 'HTML',
        },
      );

      return callback();
    }

    await ctx.telegram.sendAnimation(
      chatId,
      'https://media3.giphy.com/media/hzLgfw7C4sBwqSZ63I/giphy.gif?cid=790b761153a265113b8a7ced0cd24e76fd2c8fd60a44da44&rid=giphy.gif&ct=g',
    );

    const players = getPlayers(chatId);
    const playersBenched = getPlayersBenched(chatId);
    const allPlayers = [...players, ...playersBenched];

    const playersWithCountBenched = await getUsersWithCountBenched(allPlayers);

    const pickedPlayers = pickPlayersWeighted(playersWithCountBenched, envConfig.maxPlayers);
    const nextPlayersBenched = differenceBy(playersWithCountBenched, pickedPlayers, player => player.id);

    await playerBenchCountIncrement(nextPlayersBenched);

    setPlayers({ chatId, nextPlayers: pickedPlayers });
    setPlayersBenched({ chatId, nextPlayersBenched });

    await wait(1000);

    await ctx.telegram.sendMessage(chatId, `3...`);
    await wait(1000);

    await ctx.telegram.sendMessage(chatId, `2...`);
    await wait(1000);

    await ctx.telegram.sendMessage(chatId, `1...`);
    await wait(1000);

    for (const pickedPlayer of pickedPlayers) {
      await ctx.telegram.sendMessage(chatId, `<b>${pickedPlayer.first_name}</b>, you're in! ${POSITIVE_EMOJI}.`, { parse_mode: 'HTML' });

      await wait(1000);
    }

    const nextPlayersBenchedList = nextPlayersBenched
      .slice()
      .sort((a, b) => a.first_name.localeCompare(b.first_name))
      .map(player => `${player.first_name}`);

    const nextPlayersBenchedText = listFormatter
      .formatToParts(nextPlayersBenchedList)
      .map(formatListPart)
      .join('');

    const message = await ctx.telegram.sendMessage(chatId, `I'm so sorry ${nextPlayersBenchedText} ${NEGATIVE_EMOJI}.`, {
      parse_mode: 'HTML',
    });

    await ctx.telegram.sendAnimation(chatId, getRandomBenchedGif(), { reply_to_message_id: message.message_id });

    await createSendLineup(isCallback)(ctx);

    // await ctx.telegram.sendMessage(chatId, BENCH_YOURSELF, {
    //   parse_mode: 'HTML',
    //   ...Markup.inlineKeyboard([Markup.button.callback(PLAYER_BENCHED_EMOJI, CALLBACK_TYPE_BENCH)]),
    // });
    return callback();
  } catch (err) {
    console.error(err);

    return callback();
  }
};

export default createLottery;
