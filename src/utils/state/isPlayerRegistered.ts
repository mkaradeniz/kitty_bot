// Types
import { QuizWithRelations } from '../../db/getOrCreateCurrentQuiz';

type IsPlayerRegisteredInput = {
  currentQuiz: QuizWithRelations;
  telegramId: bigint;
};

const isPlayerRegistered = ({ currentQuiz, telegramId }: IsPlayerRegisteredInput) => {
  if (currentQuiz.players.filter(player => player.telegramId === telegramId).length === 0) {
    return false;
  }

  return true;
};

export default isPlayerRegistered;
