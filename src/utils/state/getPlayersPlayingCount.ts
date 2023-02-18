// Types
import { QuizWithRelations } from '@db/getOrCreateCurrentQuiz';

const getPlayersPlayingCount = (quiz: QuizWithRelations) => {
  const playersPlayingCount = quiz._count.players + quiz._count.playersExternal;

  return playersPlayingCount;
};

export default getPlayersPlayingCount;
