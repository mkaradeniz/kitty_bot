import isNotNullOrUndefined from '../misc/isNotNullOrUndefined';

// Types
import { KittyBotState } from '../../middleware/stateMiddleware';

const getExternalPlayersMap = (state: KittyBotState) => {
  const externalPlayersMap = state.playersExternal.reduce((externalPlayersMap, externalPlayer) => {
    if (!isNotNullOrUndefined(externalPlayersMap[externalPlayer.invitedBy.id])) {
      return {
        ...externalPlayersMap,
        [externalPlayer.invitedBy.id]: 1,
      };
    }

    return {
      ...externalPlayersMap,
      [externalPlayer.invitedBy.id]: externalPlayersMap[externalPlayer.invitedBy.id] + 1,
    };
  }, {} as { [invitedByFirstName: string]: number });

  return externalPlayersMap;
};

export default getExternalPlayersMap;
