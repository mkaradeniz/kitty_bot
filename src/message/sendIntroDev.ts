import { Markup } from 'telegraf';

import createSendMessageWithoutContext from '../utils/message/createSendMessageWithoutContext';
import envConfig from '../config/env';
import getButtonFromCallbackType from '../utils/misc/getButtonFromCallbackType';
import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';
import logger from '../utils/logger';

// Types
import { CallbackType } from '../types';
import { Telegraf } from 'telegraf';

const createSendIntroDev = (bot: Telegraf<any>) => async () => {
  if (!envConfig.isDev) {
    return;
  }

  // ! This only works if we have the `pubquizChatId` defined in the ENVs.
  if (!isNotNullOrUndefined(envConfig.pubquizChatId)) {
    return;
  }

  try {
    const sendMessageWithoutContext = createSendMessageWithoutContext(bot);

    await sendMessageWithoutContext(`${envConfig.botName} is online! 🤖`, {
      ...Markup.inlineKeyboard(
        [
          Markup.button.callback(getButtonFromCallbackType(CallbackType.Confirm), CallbackType.Confirm),
          Markup.button.callback(getButtonFromCallbackType(CallbackType.Unconfirm), CallbackType.Unconfirm),
          Markup.button.callback(getButtonFromCallbackType(CallbackType.Lineup), CallbackType.Lineup),
          Markup.button.callback(getButtonFromCallbackType(CallbackType.ConfirmGuests0), CallbackType.ConfirmGuests0),
          Markup.button.callback(getButtonFromCallbackType(CallbackType.ConfirmGuests1), CallbackType.ConfirmGuests1),
          Markup.button.callback(getButtonFromCallbackType(CallbackType.ConfirmGuests2), CallbackType.ConfirmGuests2),
          Markup.button.callback(getButtonFromCallbackType(CallbackType.ResetState), CallbackType.ResetState),
          Markup.button.callback(getButtonFromCallbackType(CallbackType.SendBookingEmail), CallbackType.SendBookingEmail),
          Markup.button.callback(getButtonFromCallbackType(CallbackType.SendCancelEmail), CallbackType.SendCancelEmail),
        ],
        { columns: 3 },
      ),
    });
  } catch (err) {
    logger.error(err);
  }
};

export default createSendIntroDev;
