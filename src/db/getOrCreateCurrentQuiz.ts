import { format } from 'date-fns';

import findNextWednesday from '../utils/misc/findNextWednesday';
import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';
import logger from '../utils/logger';
import prisma from '../../prisma/prisma';

// Types
import { Prisma } from '.prisma/client';

const getOrCreateCurrentQuizDb = async () => {
  const nextQuizDate = findNextWednesday(new Date());

  const maybeCurrentQuiz = await prisma.quiz.findUnique({
    include: {
      _count: {
        select: { players: true, playersBenched: true, playersExternal: true, playersOut: true },
      },
      players: true,
      playersBenched: true,
      playersExternal: { include: { invitedBy: true } },
      playersOut: true,
    },
    where: { date: nextQuizDate },
  });

  if (isNotNullOrUndefined(maybeCurrentQuiz)) {
    const dateFormatted = format(maybeCurrentQuiz.date, `do 'of' MMMM`);

    return { ...maybeCurrentQuiz, dateFormatted };
  }

  const createdQuiz = await prisma.quiz.create({
    data: { date: nextQuizDate },
    include: {
      _count: {
        select: { players: true, playersBenched: true, playersExternal: true, playersOut: true },
      },
      players: true,
      playersBenched: true,
      playersExternal: { include: { invitedBy: true } },
      playersOut: true,
    },
  });

  const dateFormatted = format(createdQuiz.date, `do 'of' MMMM`);

  logger.silly(`Created quiz for the ${dateFormatted}`, { label: 'src/db/getOrCreateCurrentQuiz.ts' });

  return { ...createdQuiz, dateFormatted };
};

export type QuizWithRelations = Prisma.PromiseReturnType<typeof getOrCreateCurrentQuizDb> & { dateFormatted: string };

export default getOrCreateCurrentQuizDb;
