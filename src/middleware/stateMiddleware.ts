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

export const addPlayer = (chatId: number, user: User) => {
  const nextPlayers = [...state[chatId].players.filter(player => player.id !== user.id), user];

  state[chatId].players = nextPlayers;
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

  const externalPlayersMap = getExternalPlayersMap(state[chatId]);

  const players = state[chatId].players
    .slice()
    .sort((a, b) => b.first_name.localeCompare(a.first_name))
    .map(player => `🥒🐭 ${player.first_name}`)
    .join('\n');

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

  const lineup = [players, externalPlayers, total]
    .filter(isNotNullOrUndefined)
    .join('\n')
    .trim();

  return `🍻 Our lineup for the <b>${getQuizDate(chatId)}</b> 🍻\n\n${lineup}`;
};

export const getPlayerCount = (chatId: number) => {
  return state[chatId].players.length + state[chatId].playersExternal.length;
};

export const getQuizDate = (chatId: number) => {
  const quizDate = format(state[chatId].quizDate, `do 'of' MMMM`);

  return quizDate;
};

export const isUserPlayingAlready = (chatId: number, userId: number) => {
  return state[chatId].players.findIndex(player => player.id === userId) > -1;
};

export const removePlayer = (chatId: number, user: User) => {
  const nextPlayers = [...state[chatId].players.filter(player => player.id !== user.id)];

  state[chatId].players = nextPlayers;
};

export const resetState = (chatId: number) => {
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

export const setIntroSent = (chatId: number) => {
  state[chatId].isIntroSent = true;
};

export const setLineupComplete = (chatId: number) => {
  state[chatId].isLineupComplete = true;
};

export const setReminder1Sent = (chatId: number) => {
  state[chatId].isReminder1Sent = true;
};

const stateMiddleware = async (ctx: KittyBotContext, next: () => Promise<void>) => {
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
