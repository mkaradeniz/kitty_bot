// Types
import { QuizWithRelations } from '@db/getOrCreateCurrentQuiz';

type HasPlayerInvitationsInput = {
  currentQuiz: QuizWithRelations;
  telegramId: bigint | number;
};

const hasPlayerInvitations = ({ currentQuiz, telegramId }: HasPlayerInvitationsInput) => {
  const hasInvitations = currentQuiz.playersExternal.some(playerExternal => playerExternal.invitedById === telegramId);

  return hasInvitations;
};

export default hasPlayerInvitations;
