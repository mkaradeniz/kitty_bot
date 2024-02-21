import { type Prisma } from '@prisma/client';
import { format } from 'date-fns';

import prisma from '@db-prisma/prisma';

import { logger } from '@utils/logger/logger';
import { findNextWednesday } from '@utils/misc/findNextWednesday';
import { isNotNullOrUndefined } from '@utils/misc/isNotNullOrUndefined';

export const getOrCreateCurrentQuizDb = async () => {
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

  logger.silly(`Created quiz for the ${dateFormatted}`, { label: 'src/db/getOrCreateCurrentQuiz.ts:48' });

  return { ...createdQuiz, dateFormatted };
};

export type QuizWithRelations = Prisma.PromiseReturnType<typeof getOrCreateCurrentQuizDb> & { dateFormatted: string };
