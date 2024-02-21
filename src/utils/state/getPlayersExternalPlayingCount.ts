import { type QuizWithRelations } from '@db/getOrCreateCurrentQuiz';

export const getPlayersExternalPlayingCount = (quiz: QuizWithRelations) => {
  const playersExternalPlayingCount = quiz._count.playersExternal;

  return playersExternalPlayingCount;
};
