import prisma from '../../prisma/prisma';

import getOrCreateCurrentQuizDb from './getOrCreateCurrentQuiz';

const setEmailSentDb = async () => {
  const currentQuiz = await getOrCreateCurrentQuizDb();

  await prisma.quiz.update({ data: { isEmailSent: true }, where: { id: currentQuiz.id } });

  return;
};

export default setEmailSentDb;
