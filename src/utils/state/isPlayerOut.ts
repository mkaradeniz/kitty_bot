// Types
import { QuizWithRelations } from '@db/getOrCreateCurrentQuiz';

type IsPlayerOutInput = {
  currentQuiz: QuizWithRelations;
  telegramId: bigint;
};

const isPlayerOut = ({ currentQuiz, telegramId }: IsPlayerOutInput) => {
  if (currentQuiz.playersOut.filter(player => player.telegramId === telegramId).length === 0) {
    return false;
  }

  return true;
};

export default isPlayerOut;
