import getOrCreateCurrentQuizDb from './getOrCreateCurrentQuiz';
import prisma from '../../prisma/prisma';

type ConfirmPlayersExternalDbInput = {
  invitedByTelegramId: bigint | number;
  numberOfInvitees: number;
};

const confirmPlayersExternalDb = async ({ invitedByTelegramId, numberOfInvitees }: ConfirmPlayersExternalDbInput) => {
  const currentQuiz = await getOrCreateCurrentQuizDb();

  const playerExternalToCreateArray = [...Array(numberOfInvitees)].map(_ => invitedByTelegramId);

  for (const playerExternalToCreate of playerExternalToCreateArray) {
    await prisma.playerExternal.create({
      data: { invitedById: playerExternalToCreate, quizId: currentQuiz.id },
    });
  }
};

export default confirmPlayersExternalDb;
