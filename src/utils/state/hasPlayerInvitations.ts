import { type QuizWithRelations } from '@db/getOrCreateCurrentQuiz';

type HasPlayerInvitationsInput = {
  currentQuiz: QuizWithRelations;
  telegramId: bigint | number;
};

export const hasPlayerInvitations = ({ currentQuiz, telegramId }: HasPlayerInvitationsInput) => {
  const hasInvitations = currentQuiz.playersExternal.some(playerExternal => playerExternal.invitedById === telegramId);

  return hasInvitations;
};
