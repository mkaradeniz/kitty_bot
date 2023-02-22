import prisma from '../../prisma/prisma';

import getOrCreateCurrentQuizDb from './getOrCreateCurrentQuiz';

const setLotteryDone = async () => {
  const currentQuiz = await getOrCreateCurrentQuizDb();

  await prisma.quiz.update({ data: { isLotteryDone: true }, where: { id: currentQuiz.id } });

  return;
};

export default setLotteryDone;
