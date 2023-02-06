import getOrCreateCurrentQuizDb from './getOrCreateCurrentQuiz';

const getPlayerCountDb = async () => {
  const currentQuiz = await getOrCreateCurrentQuizDb();

  const playerCount = currentQuiz.players.length;

  return playerCount;
};

export default getPlayerCountDb;
