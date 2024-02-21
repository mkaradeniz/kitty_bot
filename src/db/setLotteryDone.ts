import prisma from '@db-prisma/prisma';

import { getOrCreateCurrentQuizDb } from './getOrCreateCurrentQuiz';

export const setLotteryDone = async () => {
  const currentQuiz = await getOrCreateCurrentQuizDb();

  await prisma.quiz.update({ data: { isLotteryDone: true }, where: { id: currentQuiz.id } });

  return;
};
