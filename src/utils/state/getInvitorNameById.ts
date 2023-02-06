// Types
import { KittyBotState } from '../../middleware/stateMiddleware';

const getInvitorNameById = (invatorId: string, state: KittyBotState) => {
  return state.playersExternal.find(externalPlayer => externalPlayer.invitedBy.id === Number.parseInt(invatorId))?.invitedBy.first_name;
};

export default getInvitorNameById;
