import pluralize from 'pluralize';

import prisma from '@db-prisma/prisma';

import { logger } from '@utils/logger/logger';

import { getOrCreateCurrentQuizDb } from './getOrCreateCurrentQuiz';

type ConfirmPlayersExternalDbInput = {
  invitedByTelegramId: bigint | number;
  numberOfInvitees: number;
};

export const confirmPlayersExternalDb = async ({ invitedByTelegramId, numberOfInvitees }: ConfirmPlayersExternalDbInput) => {
  const currentQuiz = await getOrCreateCurrentQuizDb();

  const playerExternalToCreateArray = [...Array(numberOfInvitees)].map(_ => invitedByTelegramId);

  for (const playerExternalToCreate of playerExternalToCreateArray) {
    await prisma.playerExternal.create({
      data: { invitedById: playerExternalToCreate, quizId: currentQuiz.id },
    });
  }

  logger.silly(`Confirmed ${numberOfInvitees} external ${pluralize('player', numberOfInvitees)}.`, {
    label: 'src/db/confirmPlayersExternal.ts:25',
  });
};
