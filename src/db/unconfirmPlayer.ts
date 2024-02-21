import prisma from '@db-prisma/prisma';

import { logger } from '@utils/logger/logger';

import { getOrCreateCurrentQuizDb } from './getOrCreateCurrentQuiz';

export const unconfirmPlayerDb = async (telegramId: bigint | number) => {
  const currentQuiz = await getOrCreateCurrentQuizDb();

  const updatedQuiz = await prisma.quiz.update({
    data: {
      players: { disconnect: { telegramId } },
      playersOut: { connect: { telegramId } },
      playersBenched: { disconnect: { telegramId } },
    },
    where: { id: currentQuiz.id },
  });

  logger.silly(`Unconfirmed player: \`${telegramId}\`.`, { label: 'src/db/unconfirmPlayer.ts:18' });

  return updatedQuiz;
};
