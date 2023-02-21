import pluralize from 'pluralize';

import arrayify from '../utils/misc/arrayify';
import logger from '../utils/logger';
import prisma from '../../prisma/prisma';

import getOrCreateCurrentQuizDb from './getOrCreateCurrentQuiz';

const confirmPlayersDb = async (input: bigint | number | (bigint | number)[]) => {
  const telegramIds = arrayify(input);

  const currentQuiz = await getOrCreateCurrentQuizDb();

  const updatedQuiz = await prisma.quiz.update({
    data: {
      players: { connect: telegramIds.map(telegramId => ({ telegramId })) },
      playersOut: { disconnect: telegramIds.map(telegramId => ({ telegramId })) },
      playersBenched: { disconnect: telegramIds.map(telegramId => ({ telegramId })) },
    },
    include: { players: { select: { telegramId: true } } },
    where: { id: currentQuiz.id },
  });

  logger.silly(
    `Confirmed ${telegramIds.length} ${pluralize('player', telegramIds.length)}: ${telegramIds
      .map(telegramId => `\`${telegramId}\``)
      .join(', ')}.`,
    { label: 'src/db/confirmPlayers.ts:28' },
  );

  return updatedQuiz;
};

export default confirmPlayersDb;
