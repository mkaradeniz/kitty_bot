import prisma from '@db-prisma/prisma';

import { getOrCreateCurrentQuizDb } from './getOrCreateCurrentQuiz';

export const setEmailSentDb = async () => {
  const currentQuiz = await getOrCreateCurrentQuizDb();

  await prisma.quiz.update({ data: { isEmailSent: true }, where: { id: currentQuiz.id } });

  return;
};
