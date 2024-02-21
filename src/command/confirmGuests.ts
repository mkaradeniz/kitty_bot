import pluralize from 'pluralize';

import { confirmPlayersExternalDb } from '@db/confirmPlayersExternal';
import { getOrCreateCurrentQuizDb } from '@db/getOrCreateCurrentQuiz';
import { removePlayersExternalDb } from '@db/removePlayersExternal';

import { sendCurrentPlayerCount } from '@message/sendCurrentPlayerCount';
import { sendLineupCompleteMessageIfTrue } from '@message/sendLineupCompleteMessageIfTrue';
import { sendOverbookedWarningIfTrue } from '@message/sendOverbookedWarningIfTrue';
import { type MyBotContext } from '@middleware/contextMiddleware';

import { getTelegramIdFromContext } from '@utils/context/getTelegramIdFromContext';
import { getUsernameFromContext } from '@utils/context/getUsernameFromContext';
import { logger } from '@utils/logger/logger';
import { createSendMessage } from '@utils/message/createSendMessage';
import { createCallback } from '@utils/misc/createCallback';
import { isNotNullOrUndefined } from '@utils/misc/isNotNullOrUndefined';
import { getNumberOfInviteesFromEmoji } from '@utils/state/getNumberOfInviteesFromEmoji';
import { getPlayersBenchedCount } from '@utils/state/getPlayersBenchedCount';
import { hasPlayerInvitations } from '@utils/state/hasPlayerInvitations';

import { Emoji } from '@app-types/app';

type CreateConfirmGuestsInput = {
  isCallback?: boolean;
  numberOfInviteesFromCallback?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
};

export const createConfirmGuests =
  ({ isCallback = false, numberOfInviteesFromCallback }: CreateConfirmGuestsInput = {}) =>
  async (ctx: MyBotContext) => {
    const callback = createCallback({ ctx, isCallback });

    try {
      const sendMessage = createSendMessage(ctx);

      const currentQuiz = await getOrCreateCurrentQuizDb();

      const { message } = ctx.myContext;

      const telegramId = getTelegramIdFromContext(ctx);
      const { usernameInBold } = getUsernameFromContext(ctx);

      if (!isNotNullOrUndefined(telegramId)) {
        return callback();
      }

      const numberOfInvitees = numberOfInviteesFromCallback ?? getNumberOfInviteesFromEmoji(message?.text);
      const playersBenchedCount = getPlayersBenchedCount(currentQuiz);

      if (numberOfInvitees === -1) {
        return callback();
      }

      if (numberOfInvitees === 0) {
        if (!hasPlayerInvitations({ currentQuiz, telegramId })) {
          return callback();
        }

        await removePlayersExternalDb(telegramId);
        await sendMessage(`${usernameInBold} revoked their previous invitations! ${Emoji.PlayerOut}`);

        return callback();
      }

      if (playersBenchedCount > 0) {
        await sendMessage(
          `${usernameInBold}, you can't invite ${pluralize('player', numberOfInvitees)} if we still have ${
            Emoji.Team
          }s on the bench. Please unbench them before inviting guests.`,
        );

        return callback();
      }

      if (hasPlayerInvitations({ currentQuiz, telegramId })) {
        await removePlayersExternalDb(telegramId);
      }

      await sendMessage(`${usernameInBold} invited <b>${numberOfInvitees}</b> ${pluralize('player', numberOfInvitees)}! ${Emoji.Positive}`);

      await confirmPlayersExternalDb({ invitedByTelegramId: telegramId, numberOfInvitees });

      await sendCurrentPlayerCount(ctx);

      await sendLineupCompleteMessageIfTrue(ctx);
      await sendOverbookedWarningIfTrue(ctx);

      return callback();
    } catch (err) {
      logger.error(err);

      return callback();
    }
  };
