import isNotNullOrUndefined from '../misc/isNotNullOrUndefined';

// Types
import { QuizWithRelations } from '../../db/getOrCreateCurrentQuiz';

const getExternalPlayersMap = (currentQuiz: QuizWithRelations) => {
  const externalPlayersMap = currentQuiz.playersExternal.reduce((acc, playerExternal) => {
    if (!isNotNullOrUndefined(playerExternal.invitedById)) {
      return acc;
    }

    if (!isNotNullOrUndefined(acc[playerExternal.invitedById.toString()])) {
      return {
        ...acc,
        [playerExternal.invitedById.toString()]: 1,
      };
    }

    return {
      ...acc,
      [playerExternal.invitedById.toString()]: acc[playerExternal.invitedById.toString()] + 1,
    };
  }, {} as { [invitedByFirstName: string]: number });

  return externalPlayersMap;
};

export default getExternalPlayersMap;
