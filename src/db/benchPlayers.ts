import pluralize from 'pluralize';

import prisma from '@db-prisma/prisma';

import { logger } from '@utils/logger/logger';
import { arrayify } from '@utils/misc/arrayify';

import { getOrCreateCurrentQuizDb } from './getOrCreateCurrentQuiz';

export const benchPlayersDb = async (input: bigint | number | (bigint | number)[]) => {
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
    { label: 'src/db/benchPlayers.ts:28' },
  );

  return updatedQuiz;
};
