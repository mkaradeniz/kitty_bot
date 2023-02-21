import logger from '../utils/logger';
import prisma from '../../prisma/prisma';

import getOrCreateCurrentQuizDb from './getOrCreateCurrentQuiz';

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

  logger.silly(`Unconfirmed player: \`${telegramId}\`.`, { label: 'src/db/unconfirmPlayer.ts:18' });

  return updatedQuiz;
};

export default unconfirmPlayerDb;
