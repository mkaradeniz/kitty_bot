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
  isEmailSent: boolean;
  players: User[];
  playersExternal: { invitedBy: User }[];
  playersOut: User[];
  quizDate: Date;
}

let state: { [chatId: number]: KittyBotState } = {};

export const addPlayer = (chatId: number, user: User) => {
  const nextPlayers = [...state[chatId].players.filter(player => player.id !== user.id), user];
  const nextPlayersOut = [...state[chatId].players.filter(player => player.id !== user.id)];

  state[chatId].players = nextPlayers;
  state[chatId].playersOut = nextPlayersOut;
};

export const addPlayersExternal = (chatId: number, invitedBy: User, numberOfInvitees: number) => {
  const nextPlayersExternal = state[chatId].playersExternal.filter(externalPlayer => externalPlayer.invitedBy.id !== invitedBy.id);

  [...Array(numberOfInvitees)].forEach(() => {
    nextPlayersExternal.push({ invitedBy: invitedBy });
  });

  state[chatId].playersExternal = nextPlayersExternal;
};

export const getLineup = (chatId: number) => {
  const playerCount = getPlayerCount(chatId);
  const playerOutCount = getPlayerOutCount(chatId);

  const externalPlayersMap = getExternalPlayersMap(state[chatId]);

  const players = state[chatId].players
    .slice()
    .sort((a, b) => b.first_name.localeCompare(a.first_name))
    .map(player => `🥒🐭 <b>${player.first_name}</b>`)
    .join('\n');

  const playersOut = state[chatId].playersOut
    .slice()
    .sort((a, b) => b.first_name.localeCompare(a.first_name))
    .map(player => `${player.first_name}`)
    .join(',');

  const playersOutText = playerOutCount > 0 ? `\n${playersOut} ${pluralize('is', playerOutCount)} out this week.` : null;

  const externalPlayers =
    state[chatId].playersExternal.length > 0
      ? Object.entries(externalPlayersMap)
          .map(([invitedBy, numberOfInvites]) => {
            if (state[chatId].players.length === 0) {
              return `${numberOfInvites} ${pluralize('guest', numberOfInvites)} (invited by ${getInvitorNameById(
                invitedBy,
                state[chatId],
              )})`;
            }

            return `+ ${numberOfInvites} ${pluralize('guest', numberOfInvites)} (invited by ${getInvitorNameById(
              invitedBy,
              state[chatId],
            )})`;
          })
          .join('\n')
      : null;

  // const isComplete = state[chatId].isLineupComplete ? `\nThis lineup is final!` : null;

  const total = `\n<b>${playerCount}</b> ${pluralize('player', playerCount)} in total`;

  const lineup = [players, externalPlayers, playersOutText, total]
    .filter(isNotNullOrUndefined)
    .join('\n')
    .trim();

  return `🍻 Our lineup for the <b>${getQuizDate(chatId)}</b> 🍻\n\n${lineup}`;
};

export const getPlayerCount = (chatId: number) => {
  return state[chatId].players.length + state[chatId].playersExternal.length;
};

export const getPlayerOutCount = (chatId: number) => {
  return state[chatId].playersOut.length;
};

export const getQuizDate = (chatId: number) => {
  const quizDate = format(state[chatId].quizDate, `do 'of' MMMM`);

  return quizDate;
};

export const playerHasInvitations = (chatId: number, invitedBy: User) => {
  const hasInvitations = state[chatId].playersExternal.some(externalPlayer => externalPlayer.invitedBy.id === invitedBy.id);

  return hasInvitations;
};

export const isEmailSent = (chatId: number) => {
  return state[chatId].isEmailSent;
};

export const isStateDefined = (chatId: number) => {
  return isNotNullOrUndefined(state[chatId]);
};

export const isUserPlayingAlready = (chatId: number, userId: number) => {
  return state[chatId].players.findIndex(player => player.id === userId) > -1;
};

export const isUserOutAlready = (chatId: number, userId: number) => {
  return state[chatId].playersOut.findIndex(player => player.id === userId) > -1;
};

export const removePlayer = (chatId: number, user: User) => {
  const nextPlayers = [...state[chatId].players.filter(player => player.id !== user.id)];
  const nextPlayersOut = [...state[chatId].players.filter(player => player.id !== user.id), user];

  state[chatId].players = nextPlayers;
  state[chatId].playersOut = nextPlayersOut;
};

export const resetState = (chatId: number) => {
  state = {
    [chatId]: {
      isEmailSent: false,
      players: [],
      playersExternal: [],
      playersOut: [],
      quizDate: findNextWednesday(new Date()),
    },
  };
};

export const setEmailSent = (chatId: number) => {
  state[chatId].isEmailSent = true;
};

const stateMiddleware = async (ctx: KittyBotContext, next: () => Promise<void>) => {
  if (!isNotNullOrUndefined(state[ctx.myContext.chatId])) {
    resetState(ctx.myContext.chatId);
  }

  if (isAfter(new Date(), ctx.state.quizDate)) {
    resetState(ctx.myContext.chatId);
  }

  return next();
};

export default stateMiddleware;
