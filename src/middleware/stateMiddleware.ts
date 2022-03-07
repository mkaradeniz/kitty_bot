import pluralize from 'pluralize';
import { format, isAfter } from 'date-fns';

import findNextWednesday from '../utils/date/findNextWednesday';
import getExternalPlayersMap from '../utils/state/getExternalPlayersMap';
import getInvitorNameById from '../utils/state/getInvitorNameById';
import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';

// Types
import { KittyBotContext } from './contextMiddleware';
import { User } from 'telegraf/typings/core/types/typegram';

export interface KittyBotState {
  isIntroSent: boolean;
  isLineupComplete: boolean;
  isReminder1Sent: boolean;
  players: User[];
  playersExternal: { invitedBy: User }[];
  quizDate: Date;
}

let state: { [chatId: number]: KittyBotState } = {};

const stateMiddleware = async (ctx: KittyBotContext, next: () => Promise<void>) => {
  const addPlayer = (chatId: number, user: User) => {
    const nextPlayersExternal = [...state[chatId].players.filter(player => player.id !== user.id), user];

    state[chatId].players = nextPlayersExternal;
  };

  const addPlayersExternal = (chatId: number, invitedBy: User, numberOfInvitees: number) => {
    const nextPlayersExternal = state[chatId].playersExternal.filter(externalPlayer => externalPlayer.invitedBy.id !== invitedBy.id);

    [...Array(numberOfInvitees)].forEach(() => {
      nextPlayersExternal.push({ invitedBy: invitedBy });
    });

    state[chatId].playersExternal = nextPlayersExternal;
  };

  const getLineup = (chatId: number) => {
    const playerCount = getPlayerCount(chatId);

    const externalPlayersMap = getExternalPlayersMap(state[chatId]);

    const players = state[chatId].players
      .slice()
      .sort((a, b) => b.first_name.localeCompare(a.first_name))
      .map(player => `🥒🐭 ${player.first_name}`)
      .join('\n');

    const externalPlayers = Object.entries(externalPlayersMap)
      .map(([invitedBy, numberOfInvites]) => {
        if (state[chatId].players.length === 0) {
          return `${numberOfInvites} ${pluralize('guest', numberOfInvites)} (invited by ${getInvitorNameById(invitedBy, state[chatId])})`;
        }

        return `\n + ${numberOfInvites} ${pluralize('guest', numberOfInvites)} (invited by ${getInvitorNameById(
          invitedBy,
          state[chatId],
        )})`;
      })
      .join('\n');

    const lineup = [players, externalPlayers].join(' ').trim();

    return `🍻 Our lineup for the <b>${getQuizDate(chatId)}</B> 🍻\n\n${lineup}\n\n${playerCount} ${pluralize(
      'player',
      playerCount,
    )} in total`;
  };

  const getPlayerCount = (chatId: number) => {
    return state[chatId].players.length + state[chatId].playersExternal.length;
  };

  const getQuizDate = (chatId: number) => {
    const quizDate = format(state[chatId].quizDate, `do 'of' MMMM`);

    return quizDate;
  };

  const isUserPlayingAlready = (chatId: number, userId: number) => {
    return state[chatId].players.findIndex(player => player.id === userId) > -1;
  };

  const resetState = (chatId: number) => {
    state = {
      [chatId]: {
        isIntroSent: false,
        isLineupComplete: false,
        isReminder1Sent: false,
        players: [],
        playersExternal: [],
        quizDate: findNextWednesday(),
      },
    };
  };

  const setIntroSent = (chatId: number) => {
    state[chatId].isIntroSent = true;
  };

  const setLineupComplete = (chatId: number) => {
    state[chatId].isLineupComplete = true;
  };

  const setReminder1Sent = (chatId: number) => {
    state[chatId].isReminder1Sent = true;
  };

  ctx.myContext.addPlayer = addPlayer;
  ctx.myContext.addPlayersExternal = addPlayersExternal;
  ctx.myContext.getLineup = getLineup;
  ctx.myContext.getPlayerCount = getPlayerCount;
  ctx.myContext.getQuizDate = getQuizDate;
  ctx.myContext.isUserPlayingAlready = isUserPlayingAlready;
  ctx.myContext.resetState = resetState;
  ctx.myContext.setIntroSent = setIntroSent;
  ctx.myContext.setLineupComplete = setLineupComplete;
  ctx.myContext.setReminder1Sent = setReminder1Sent;

  ctx.myContext.state = state;

  if (!isNotNullOrUndefined(ctx.myContext?.state?.[ctx.myContext.chatId])) {
    resetState(ctx.myContext.chatId);
  }

  if (isAfter(new Date(), ctx.state.quizDate)) {
    resetState(ctx.myContext.chatId);
  }

  return next();
};

export default stateMiddleware;
