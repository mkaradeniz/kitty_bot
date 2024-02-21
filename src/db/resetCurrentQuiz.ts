import prisma from '@db-prisma/prisma';

import { logger } from '@utils/logger/logger';

import { getOrCreateCurrentQuizDb } from './getOrCreateCurrentQuiz';

export const resetCurrentQuizDb = async () => {
  const currentQuiz = await getOrCreateCurrentQuizDb();

  await prisma.quiz.update({
    data: {
      isEmailSent: false,
      isLotteryDone: false,
      players: { set: [] },
      playersBenched: { set: [] },
      playersExternal: { set: [] },
      playersOut: { set: [] },
    },
    where: { id: currentQuiz.id },
  });

  logger.silly(`Reset quiz for the ${currentQuiz.dateFormatted}.`, { label: 'src/db/resetCurrentQuiz.ts:21' });
};
