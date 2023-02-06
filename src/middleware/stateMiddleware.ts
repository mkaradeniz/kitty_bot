import pluralize from 'pluralize';
import { format, isAfter } from 'date-fns';

import findNextWednesday from '../utils/misc/findNextWednesday';
import formatListPart from '../utils/misc/formatListPart';
import getExternalPlayersMap from '../utils/state/getExternalPlayersMap';
import getInvitorNameById from '../utils/state/getInvitorNameById';
import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';
import { LINEUP_EMOJI, PLAYER_OUT_EMOJI, PLAYER_BENCHED_EMOJI, TEAM_EMOJI, BENCH_YOURSELF } from '../config/texts';

// Types
import { KittyBotContext } from './contextMiddleware';
import { User } from 'telegraf/typings/core/types/typegram';

export interface KittyBotState {
  isEmailSent: boolean;
  players: User[];
  playersBenched: User[];
  playersExternal: { invitedBy: User }[];
  playersOut: User[];
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
    nextPlayersExternal.push({ invitedBy });
  });

  state[chatId].playersExternal = nextPlayersExternal;
};

export const benchPlayer = (chatId: number, user: User) => {
  const nextPlayers = [...state[chatId].players.filter(player => player.id !== user.id)];
  const nextPlayersBenched = [...state[chatId].playersBenched.filter(player => player.id !== user.id), user];

  state[chatId].players = nextPlayers;
  state[chatId].playersBenched = nextPlayersBenched;
};

export const getLineup = (chatId: number) => {
  const playerCount = getPlayerCount(chatId);
  const playerOutCount = getPlayerOutCount(chatId);
  const playerBenchedCount = getPlayerBenchedCount(chatId);

  const externalPlayersMap = getExternalPlayersMap(state[chatId]);

  const players = state[chatId].players
    .slice()
    .sort((a, b) => a.first_name.localeCompare(b.first_name))
    .map(player => `${TEAM_EMOJI} <b>${player.first_name}</b>`)
    .join('\n');

  const playersOutList = state[chatId].playersOut
    .slice()
    .sort((a, b) => a.first_name.localeCompare(b.first_name))
    .map(player => `${player.first_name}`);

  const playersBenchedList = state[chatId].playersBenched
    .slice()
    .sort((a, b) => a.first_name.localeCompare(b.first_name))
    .map(player => `${player.first_name}`);

  const playersOut = listFormatter
    .formatToParts(playersOutList)
    .map(formatListPart)
    .join('');

  const playersBenched = listFormatter
    .formatToParts(playersBenchedList)
    .map(formatListPart)
    .join('');

  const playersOutText =
    playerOutCount > 0 ? `\n${PLAYER_OUT_EMOJI} ${playersOut} ${pluralize('is', playerOutCount)} out this week.` : null;

  const playersBenchedText =
    playerBenchedCount > 0 ? `\n${PLAYER_BENCHED_EMOJI} ${playersBenched} ${pluralize('is', playerBenchedCount)} benched this week.` : null;

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

  const benchCta = playerBenchedCount > 0 ? `\n${BENCH_YOURSELF}` : null;

  const lineup = [players, externalPlayers, playersBenchedText, playersOutText, total, benchCta]
    .filter(isNotNullOrUndefined)
    .join('\n')
    .trim();

  return `${LINEUP_EMOJI} Our lineup for the <b>${getQuizDate(chatId)}</b> ${LINEUP_EMOJI}\n\n${lineup}`;
};

export const getPlayers = (chatId: number) => {
  return state[chatId].players;
};

export const getPlayersBenched = (chatId: number) => {
  return state[chatId].playersBenched;
};

type SetPlayersInput = {
  chatId: number;
  nextPlayers: User[];
};

export const setPlayers = ({ chatId, nextPlayers }: SetPlayersInput) => {
  state[chatId].players = nextPlayers;
};

type SetPlayersBenchedInput = {
  chatId: number;
  nextPlayersBenched: User[];
};

export const setPlayersBenched = ({ chatId, nextPlayersBenched }: SetPlayersBenchedInput) => {
  state[chatId].playersBenched = nextPlayersBenched;
};

export const getPlayerCount = (chatId: number) => {
  return state[chatId].players.length + state[chatId].playersExternal.length;
};

export const getPlayerOutCount = (chatId: number) => {
  return state[chatId].playersOut.length;
};

export const getPlayerBenchedCount = (chatId: number) => {
  return state[chatId].playersBenched.length;
};

export const getPlayerExternalCount = (chatId: number) => {
  return state[chatId].playersExternal.length;
};

export const getState = (chatId: number) => {
  return state[chatId];
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

type IsUserBenchedInput = {
  chatId: number;
  userId: number;
};

export const isUserBenched = ({ chatId, userId }: IsUserBenchedInput) => {
  return state[chatId].playersBenched.map(playerBenched => playerBenched.id).includes(userId);
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
      playersBenched: [],
      quizDate: findNextWednesday(new Date()),
    },
  };

  // eslint-disable-next-line no-console
  console.info(`State has been reset.`, new Date().toISOString());
};

export const setEmailSent = (chatId: number) => {
  state[chatId].isEmailSent = true;
};

const stateMiddleware = (ctx: KittyBotContext, next: () => Promise<void>) => {
  try {
    if (!isNotNullOrUndefined(state[ctx.myContext.chatId])) {
      resetState(ctx.myContext.chatId);
    }

    if (isAfter(new Date(), state[ctx.myContext.chatId].quizDate)) {
      resetState(ctx.myContext.chatId);
    }

    return next();
  } catch (err) {
    console.error(err);

    return next();
  }
};

export default stateMiddleware;
