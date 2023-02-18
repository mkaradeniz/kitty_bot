// Types
import { QuizWithRelations } from '@db/getOrCreateCurrentQuiz';

const getPlayersBenchedCount = (quiz: QuizWithRelations) => {
  const playersPlayingCount = quiz._count.playersBenched;

  return playersPlayingCount;
};

export default getPlayersBenchedCount;
