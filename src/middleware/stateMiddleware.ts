import { format, isAfter } from 'date-fns';

import findNextWednesday from '../utils/date/findNextWednesday';
import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';

// Types
import { ChatMember, User } from 'telegraf/typings/core/types/typegram';
import { KittyBotContext } from './contextMiddleware';
import pluralize from 'pluralize';

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

    const externalPlayersMap = state[chatId].playersExternal.reduce((externalPlayersMap, externalPlayer) => {
      if (!isNotNullOrUndefined(externalPlayersMap[externalPlayer.invitedBy.id])) {
        return {
          ...externalPlayersMap,
          [externalPlayer.invitedBy.id]: 1,
        };
      }

      return {
        ...externalPlayersMap,
        [externalPlayer.invitedBy.id]: externalPlayersMap[externalPlayer.invitedBy.id] + 1,
      };
    }, {} as { [invitedByFirstName: string]: number });

    const players = state[chatId].players
      .slice()
      .sort((a, b) => b.first_name.localeCompare(a.first_name))
      .map(player => `🥒🐭 ${player.first_name}`)
      .join('\n');

    const getInvitorNameById = (invatorId: string) => {
      return state[chatId].playersExternal.find(externalPlayer => externalPlayer.invitedBy.id === Number.parseInt(invatorId))?.invitedBy
        .first_name;
    };

    const externalPlayers = Object.entries(externalPlayersMap)
      .map(
        ([invitedBy, numberOfInvites]) =>
          `\n + ${numberOfInvites} ${pluralize('random', numberOfInvites)} (invited by ${getInvitorNameById(invitedBy)})`,
      )
      .join('\n');

    const lineup2 = [players, externalPlayers].join(' ');

    const lineup = `Our lineup for the <b>${getQuizDate(chatId)}</B>\n${lineup2}\nTotal: ${playerCount} ${pluralize(
      'player',
      playerCount,
    )}`;

    return lineup;
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
