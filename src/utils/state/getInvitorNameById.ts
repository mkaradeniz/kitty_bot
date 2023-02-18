// Types
import { QuizWithRelations } from '../../db/getOrCreateCurrentQuiz';

type GetInvitorNameByIdInput = {
  currentQuiz: QuizWithRelations;
  invitorTelegramId: bigint | number;
};

const getInvitorNameById = ({ currentQuiz, invitorTelegramId }: GetInvitorNameByIdInput) => {
  return currentQuiz.playersExternal.find(externalPlayer => externalPlayer.invitedById === invitorTelegramId)?.invitedBy?.firstName;
};

export default getInvitorNameById;
