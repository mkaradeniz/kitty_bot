import logger from '@utils/logger';
import prisma from '@prisma/prisma';

import getOrCreateCurrentQuizDb from './getOrCreateCurrentQuiz';

const resetCurrentQuizDb = async () => {
  const currentQuiz = await getOrCreateCurrentQuizDb();

  await prisma.quiz.update({
    data: {
      isEmailSent: false,
      players: { set: [] },
      playersBenched: { set: [] },
      playersExternal: { set: [] },
      playersOut: { set: [] },
    },
    where: { id: currentQuiz.id },
  });

  logger.silly(`Reset quiz for the ${currentQuiz.dateFormatted}.`, { label: 'src/db/resetCurrentQuiz.ts' });
};

export default resetCurrentQuizDb;
