import arrayify from '../utils/misc/arrayify';
import getOrCreateCurrentQuizDb from './getOrCreateCurrentQuiz';
import prisma from '../../prisma/prisma';

const confirmPlayersDb = async (input: bigint | number | (bigint | number)[]) => {
  const telegramIds = arrayify(input);

  const currentQuiz = await getOrCreateCurrentQuizDb();

  const updatedQuiz = await prisma.quiz.update({
    data: {
      players: { connect: telegramIds.map(telegramId => ({ telegramId })) },
      playersOut: { disconnect: telegramIds.map(telegramId => ({ telegramId })) },
      playersBenched: { disconnect: telegramIds.map(telegramId => ({ telegramId })) },
    },
    where: { id: currentQuiz.id },
  });

  return updatedQuiz;
};

export default confirmPlayersDb;
