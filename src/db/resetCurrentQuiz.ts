import getOrCreateCurrentQuizDb from './getOrCreateCurrentQuiz';
import prisma from '../../prisma/prisma';

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
};

export default resetCurrentQuizDb;
