import pluralize from 'pluralize';

import prisma from '@db-prisma/prisma';

import { logger } from '@utils/logger/logger';

import { getOrCreateCurrentQuizDb } from './getOrCreateCurrentQuiz';

export const removePlayersExternalDb = async (invitedByTelegramId: bigint | number) => {
  const currentQuiz = await getOrCreateCurrentQuizDb();

  await prisma.playerExternal.deleteMany({
    where: {
      id: {
        in: currentQuiz.playersExternal
          .filter(playerExternal => playerExternal.invitedById === invitedByTelegramId)
          .map(playerExternal => playerExternal.id),
      },
    },
  });

  const removedPlayersExternalCount = currentQuiz.playersExternal.filter(
    playerExternal => playerExternal.invitedById === invitedByTelegramId,
  ).length;

  logger.silly(`Removed ${removedPlayersExternalCount} external ${pluralize('player', removedPlayersExternalCount)}.`, {
    label: 'src/db/removePlayersExternal.ts:26',
  });
};
