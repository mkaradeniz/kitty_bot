import { type QuizWithRelations } from '@db/getOrCreateCurrentQuiz';

export const getPlayersOutCount = (quiz: QuizWithRelations) => {
  const playersOutCount = quiz._count.playersOut;

  return playersOutCount;
};
