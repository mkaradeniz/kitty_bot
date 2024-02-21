import { type QuizWithRelations } from '@db/getOrCreateCurrentQuiz';

export const getPlayersPlayingCount = (quiz: QuizWithRelations) => {
  const playersPlayingCount = quiz._count.players + quiz._count.playersExternal;

  return playersPlayingCount;
};
