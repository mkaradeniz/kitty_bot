import pluralize from 'pluralize';
import { format, isAfter } from 'date-fns';

import findNextWednesday from '../utils/misc/findNextWednesday';
import formatListPart from '../utils/misc/formatListPart';
import getExternalPlayersMap from '../utils/state/getExternalPlayersMap';
import getInvitorNameById from '../utils/state/getInvitorNameById';
import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';
import { LINEUP_EMOJI, PLAYER_OUT_EMOJI, PLAYER_REJECTED_EMOJI } from '../config/texts';

// Types
import { KittyBotContext } from './contextMiddleware';
import { User } from 'telegraf/typings/core/types/typegram';

export interface KittyBotState {
  isEmailSent: boolean;
  players: User[];
  playersExternal: { invitedBy: User }[];
  playersOut: User[];
  playersRejected: User[];
  quizDate: Date;
}

let state: { [chatId: number]: KittyBotState } = {};

// @ts-expect-error | TypeScript doesn't have types for this yet.
const listFormatter = new Intl.ListFormat('en');

export const addPlayer = (chatId: number, user: User) => {
  const nextPlayers = [...state[chatId].players.filter(player => player.id !== user.id), user];
  const nextPlayersOut = [...state[chatId].playersOut.filter(player => player.id !== user.id)];

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
  const playerRejectedCount = getPlayerRejectedCount(chatId);

  const externalPlayersMap = getExternalPlayersMap(state[chatId]);

  const players = state[chatId].players
    .slice()
    .sort((a, b) => a.first_name.localeCompare(b.first_name))
    .map(player => `🥒🐭 <b>${player.first_name}</b>`)
    .join('\n');

  const playersOutList = state[chatId].playersOut
    .slice()
    .sort((a, b) => a.first_name.localeCompare(b.first_name))
    .map(player => `${player.first_name}`);

  const playersRejectedList = state[chatId].playersRejected
    .slice()
    .sort((a, b) => a.first_name.localeCompare(b.first_name))
    .map(player => `${player.first_name}`);

  const playersOut = listFormatter
    .formatToParts(playersOutList)
    .map(formatListPart)
    .join('');

  const playersRejected = listFormatter
    .formatToParts(playersRejectedList)
    .map(formatListPart)
    .join('');

  const playersOutText =
    playerOutCount > 0 ? `\n${PLAYER_OUT_EMOJI} ${playersOut} ${pluralize('is', playerOutCount)} out this week.` : null;

  const playersRejectedText =
    playerRejectedCount > 0
      ? `\n${PLAYER_REJECTED_EMOJI} ${playersRejected} ${pluralize('was', playerRejectedCount)} not picked in the lottery.`
      : null;

  const externalPlayers =
    state[chatId].playersExternal.length > 0
      ? Object.entries(externalPlayersMap)
          .map(([invitedBy, numberOfInvites]) => {
            if (state[chatId].players.length === 0) {
              return `<b>${numberOfInvites}</b> ${pluralize('guest', numberOfInvites)} (invited by ${getInvitorNameById(
                invitedBy,
                state[chatId],
              )})`;
            }

            return `+ <b>${numberOfInvites}</b> ${pluralize('guest', numberOfInvites)} (invited by ${getInvitorNameById(
              invitedBy,
              state[chatId],
            )})`;
          })
          .join('\n')
      : null;

  const total = `\n<b>${playerCount}</b> ${pluralize('player', playerCount)} in total`;

  const lineup = [players, externalPlayers, playersRejectedText, playersOutText, total]
    .filter(isNotNullOrUndefined)
    .join('\n')
    .trim();

  return `${LINEUP_EMOJI} Our lineup for the <b>${getQuizDate(chatId)}</b> ${LINEUP_EMOJI}\n\n${lineup}`;
};

export const getPlayers = (chatId: number) => {
  return state[chatId].players;
};

export const getPlayersRejected = (chatId: number) => {
  return state[chatId].playersRejected;
};

type SetPlayersInput = {
  chatId: number;
  nextPlayers: User[];
};

export const setPlayers = ({ chatId, nextPlayers }: SetPlayersInput) => {
  state[chatId].players = nextPlayers;
};

type SetPlayersRejectedInput = {
  chatId: number;
  nextPlayersRejected: User[];
};

export const setPlayersRejected = ({ chatId, nextPlayersRejected }: SetPlayersRejectedInput) => {
  state[chatId].playersRejected = nextPlayersRejected;
};

export const getPlayerCount = (chatId: number) => {
  return state[chatId].players.length + state[chatId].playersExternal.length;
};

export const getPlayerOutCount = (chatId: number) => {
  return state[chatId].playersOut.length;
};

export const getPlayerRejectedCount = (chatId: number) => {
  return state[chatId].playersRejected.length;
};

export const getPlayerExternalCount = (chatId: number) => {
  return state[chatId].playersExternal.length;
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
  const nextPlayersOut = [...state[chatId].playersOut.filter(player => player.id !== user.id), user];

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
      playersRejected: [],
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
