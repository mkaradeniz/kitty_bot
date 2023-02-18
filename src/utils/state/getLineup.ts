import pluralize from 'pluralize';

import formatListPart from '@utils/misc/formatListPart';
import isNotNullOrUndefined from '@utils/misc/isNotNullOrUndefined';
import { EMOJI_LINEUP, EMOJI_PLAYER_BENCHED, EMOJI_PLAYER_OUT, EMOJI_TEAM } from '@config/texts';

import getExternalPlayersMap from './getExternalPlayersMap';
import getInvitorNameById from './getInvitorNameById';
import getPlayersBenchedCount from './getPlayersBenchedCount';
import getPlayersOutCount from './getPlayersOutCount';
import getPlayersPlayingCount from './getPlayersPlayingCount';

// Types
import { QuizWithRelations } from '../../db/getOrCreateCurrentQuiz';

// @ts-expect-error | TypeScript doesn't have types for this yet.
const listFormatter = new Intl.ListFormat('en');

const getLineup = (currentQuiz: QuizWithRelations) => {
  const playersPlayingCount = getPlayersPlayingCount(currentQuiz);
  const playersOutCount = getPlayersOutCount(currentQuiz);
  const playersBenchedCount = getPlayersBenchedCount(currentQuiz);

  const externalPlayersMap = getExternalPlayersMap(currentQuiz);

  const players = currentQuiz.players
    .slice()
    .sort((a, b) => a.firstName.localeCompare(b.firstName))
    .map(player => `${EMOJI_TEAM} <b>${player.firstName}</b>`)
    .join('\n');

  const playersOutList = currentQuiz.playersOut
    .slice()
    .sort((a, b) => a.firstName.localeCompare(b.firstName))
    .map(player => `${player.firstName}`);

  const playersBenchedList = currentQuiz.playersBenched
    .slice()
    .sort((a, b) => a.firstName.localeCompare(b.firstName))
    .map(player => `${player.firstName}`);

  const playersOut = listFormatter.formatToParts(playersOutList).map(formatListPart).join('');

  const playersBenched = listFormatter.formatToParts(playersBenchedList).map(formatListPart).join('');

  const playersOutText =
    playersOutCount > 0 ? `\n${EMOJI_PLAYER_OUT} ${playersOut} ${pluralize('is', playersOutCount)} out this week.` : null;

  const playersBenchedText =
    playersBenchedCount > 0
      ? `\n${EMOJI_PLAYER_BENCHED} ${playersBenched} ${pluralize('is', playersBenchedCount)} benched this week.`
      : null;

  const externalPlayers =
    currentQuiz.playersExternal.length > 0
      ? Object.entries(externalPlayersMap)
          .map(([invitedBy, numberOfInvites]) => {
            if (currentQuiz.players.length === 0) {
              return `<b>${numberOfInvites}</b> ${pluralize('guest', numberOfInvites)} (invited by ${getInvitorNameById({
                currentQuiz,
                invitorTelegramId: BigInt(invitedBy),
              })})`;
            }

            return `+ <b>${numberOfInvites}</b> ${pluralize('guest', numberOfInvites)} (invited by ${getInvitorNameById({
              currentQuiz,
              invitorTelegramId: BigInt(invitedBy),
            })})`;
          })
          .join('\n')
      : null;

  const total = `\n<b>${playersPlayingCount}</b> ${pluralize('player', playersPlayingCount)} in total.`;

  const benchCta =
    playersBenchedCount > 0
      ? `\nIf you're one of the lucky ones who got picked this week, but want to bench yourself in favor of a another player. Send a ${EMOJI_PLAYER_BENCHED} or click on the button below.`
      : null;

  const lineup = [players, externalPlayers, playersBenchedText, playersOutText, total, benchCta]
    .filter(isNotNullOrUndefined)
    .join('\n')
    .trim();

  return `${EMOJI_LINEUP} Our lineup for the <b>${currentQuiz.dateFormatted}</b> ${EMOJI_LINEUP}\n\n${lineup}`;
};

export default getLineup;
