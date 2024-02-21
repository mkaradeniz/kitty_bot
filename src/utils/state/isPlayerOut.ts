import { type QuizWithRelations } from '@db/getOrCreateCurrentQuiz';

type IsPlayerOutInput = {
  currentQuiz: QuizWithRelations;
  telegramId: bigint;
};

export const isPlayerOut = ({ currentQuiz, telegramId }: IsPlayerOutInput) => {
  if (currentQuiz.playersOut.filter(player => player.telegramId === telegramId).length === 0) {
    return false;
  }

  return true;
};
