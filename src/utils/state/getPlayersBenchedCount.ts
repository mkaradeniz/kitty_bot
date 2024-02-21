import { type QuizWithRelations } from '@db/getOrCreateCurrentQuiz';

export const getPlayersBenchedCount = (quiz: QuizWithRelations) => {
  const playersPlayingCount = quiz._count.playersBenched;

  return playersPlayingCount;
};
