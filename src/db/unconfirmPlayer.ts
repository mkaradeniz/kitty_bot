import getOrCreateCurrentQuizDb from './getOrCreateCurrentQuiz';
import prisma from '../../prisma/prisma';

const unconfirmPlayerDb = async (telegramId: bigint | number) => {
  const currentQuiz = await getOrCreateCurrentQuizDb();

  const updatedQuiz = await prisma.quiz.update({
    data: {
      players: { disconnect: { telegramId } },
      playersOut: { connect: { telegramId } },
      playersBenched: { disconnect: { telegramId } },
    },
    where: { id: currentQuiz.id },
  });

  return updatedQuiz;
};

export default unconfirmPlayerDb;
