import { QuizWithRelations } from '../../db/getOrCreateCurrentQuiz';

const getPlayersOutCount = (quiz: QuizWithRelations) => {
  const playersOutCount = quiz._count.playersOut;

  return playersOutCount;
};

export default getPlayersOutCount;
