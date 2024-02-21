import { type QuizWithRelations } from '@db/getOrCreateCurrentQuiz';

type GetInvitorNameByIdInput = {
  currentQuiz: QuizWithRelations;
  invitorTelegramId: bigint | number;
};

export const getInvitorNameById = ({ currentQuiz, invitorTelegramId }: GetInvitorNameByIdInput) => {
  return currentQuiz.playersExternal.find(externalPlayer => externalPlayer.invitedById === invitorTelegramId)?.invitedBy?.firstName;
};
