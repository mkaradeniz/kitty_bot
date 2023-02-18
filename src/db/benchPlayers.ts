import pluralize from 'pluralize';

import arrayify from '../utils/misc/arrayify';
import logger from '../utils/logger';
import prisma from '../../prisma/prisma';

import getOrCreateCurrentQuizDb from './getOrCreateCurrentQuiz';

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

  logger.silly(
    `Benched ${telegramIds.length} ${pluralize('player', telegramIds.length)}: ${telegramIds
      .map(telegramId => `\`${telegramId}\``)
      .join(', ')}.`,
    { label: 'src/db/benchPlayers.ts' },
  );

  return updatedQuiz;
};

export default benchPlayersDb;
