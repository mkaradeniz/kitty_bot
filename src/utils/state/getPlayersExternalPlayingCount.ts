import { QuizWithRelations } from '../../db/getOrCreateCurrentQuiz';

const getPlayersExternalPlayingCount = (quiz: QuizWithRelations) => {
  const playersExternalPlayingCount = quiz._count.playersExternal;

  return playersExternalPlayingCount;
};

export default getPlayersExternalPlayingCount;
