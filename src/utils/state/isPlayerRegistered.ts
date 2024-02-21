import { type QuizWithRelations } from '@db/getOrCreateCurrentQuiz';

type IsPlayerRegisteredInput = {
  currentQuiz: QuizWithRelations;
  telegramId: bigint;
};

export const isPlayerRegistered = ({ currentQuiz, telegramId }: IsPlayerRegisteredInput) => {
  if (currentQuiz.players.filter(player => player.telegramId === telegramId).length === 0) {
    return false;
  }

  return true;
};
