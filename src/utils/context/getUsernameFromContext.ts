import isNotNullOrUndefined from '../misc/isNotNullOrUndefined';

// Types
import { MyBotContext } from '../../middleware/contextMiddleware';

const getUsernameFromContext = (ctx: MyBotContext) => {
  const username = ctx.myContext.user?.first_name;

  if (!isNotNullOrUndefined(username)) {
    // ! I think that never actually happens.
    return { username: '👻', usernameInBold: '👻' };
  }

  const usernameInBold = `<b>${username}</b>`;

  return { username, usernameInBold };
};

export default getUsernameFromContext;
