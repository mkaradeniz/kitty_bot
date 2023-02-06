// Types
import { QuizWithRelations } from '../../db/getOrCreateCurrentQuiz';

type IsPlayerBenchedInput = {
  currentQuiz: QuizWithRelations;
  telegramId: bigint;
};

const isPlayerBenched = ({ currentQuiz, telegramId }: IsPlayerBenchedInput) => {
  if (currentQuiz.playersBenched.filter(player => player.telegramId === telegramId).length === 0) {
    return false;
  }

  return true;
};

export default isPlayerBenched;
