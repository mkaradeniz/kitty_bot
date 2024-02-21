import prisma from '@db-prisma/prisma';

import { logger } from '@utils/logger/logger';
import { isNotNullOrUndefined } from '@utils/misc/isNotNullOrUndefined';

export const calculateLastQuizsBenchedPlayersBenchCount = async () => {
  try {
    const quizzesWithBenchesUncounted = await prisma.quiz.findMany({
      orderBy: [{ date: 'desc' }],
      select: { benchesCounted: true, id: true, playersBenched: true },
      // We only want to count the benched players on past quizzes, so we'll always skip the first.
      skip: 1,
      where: { benchesCounted: false },
    });

    for (const quizWithBenchesUncounted of quizzesWithBenchesUncounted) {
      for (const playerBenched of quizWithBenchesUncounted.playersBenched) {
        const player = await prisma.player.findUnique({ select: { countBenched: true }, where: { id: playerBenched.id } });

        if (!isNotNullOrUndefined(player)) {
          continue;
        }

        await prisma.player.update({ data: { countBenched: player.countBenched + 1 }, where: { id: playerBenched.id } });

        logger.info(`Incremented bench count for \`${playerBenched.id}\`.`, {
          label: 'src/db/calculateLastQuizsBenchedPlayersBenchCount.ts:26',
        });
      }

      await prisma.quiz.update({ data: { benchesCounted: true }, where: { id: quizWithBenchesUncounted.id } });
    }
  } catch (err) {
    logger.error(err);
  }
};
