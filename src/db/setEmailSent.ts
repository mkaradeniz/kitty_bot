import getOrCreateCurrentQuizDb from './getOrCreateCurrentQuiz';
import prisma from '../../prisma/prisma';

const setEmailSentDb = async () => {
  const currentQuiz = await getOrCreateCurrentQuizDb();

  await prisma.quiz.update({ data: { isEmailSent: true }, where: { id: currentQuiz.id } });

  return;
};

export default setEmailSentDb;
