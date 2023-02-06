import arrayify from '../utils/misc/arrayify';
import getOrCreateCurrentQuizDb from './getOrCreateCurrentQuiz';
import prisma from '../../prisma/prisma';

const benchPlayersDb = async (input: bigint | number | (bigint | number)[]) => {
  const telegramIds = arrayify(input);

  const currentQuiz = await getOrCreateCurrentQuizDb();

  const updatedQuiz = await prisma.quiz.update({
    data: {
      players: { disconnect: telegramIds.map(telegramId => ({ telegramId })) },
      playersOut: { disconnect: telegramIds.map(telegramId => ({ telegramId })) },
      playersBenched: { connect: telegramIds.map(telegramId => ({ telegramId })) },
    },
    include: { playersBenched: true },
    where: { id: currentQuiz.id },
  });

  return updatedQuiz;
};

export default benchPlayersDb;
