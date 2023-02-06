import getOrCreateCurrentQuizDb from './getOrCreateCurrentQuiz';
import prisma from '../../prisma/prisma';

const removePlayersExternalDb = async (invitedByTelegramId: bigint | number) => {
  const currentQuiz = await getOrCreateCurrentQuizDb();

  await prisma.playerExternal.deleteMany({
    where: {
      id: {
        in: currentQuiz.playersExternal
          .filter(playerExternal => playerExternal.invitedById === invitedByTelegramId)
          .map(playerExternal => playerExternal.id),
      },
    },
  });
};

export default removePlayersExternalDb;
