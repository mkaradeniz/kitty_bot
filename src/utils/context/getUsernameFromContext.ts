import { isNotNullOrUndefined } from '@utils/misc/isNotNullOrUndefined';

import { type MyBotContext } from '../../middleware/contextMiddleware';

export const getUsernameFromContext = (ctx: MyBotContext) => {
  const username = ctx.myContext.user?.first_name;

  if (!isNotNullOrUndefined(username)) {
    // ! I think that never actually happens.
    return { username: '👻', usernameInBold: '👻' };
  }

  const usernameInBold = `<b>${username}</b>`;

  return { username, usernameInBold };
};
