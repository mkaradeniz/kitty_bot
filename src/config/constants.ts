import { Markup } from 'telegraf';

import getButtonFromCallbackType from '@utils/misc/getButtonFromCallbackType';

// Types
import { CallbackType } from '@types';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

export const BUTTONS_DEV: ExtraReplyMessage = {
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
};

export const BUTTONS_TUTORIAL: ExtraReplyMessage = {
  ...Markup.inlineKeyboard([
    Markup.button.callback(getButtonFromCallbackType(CallbackType.Confirm), CallbackType.Confirm),
    Markup.button.callback(getButtonFromCallbackType(CallbackType.Unconfirm), CallbackType.Unconfirm),
    Markup.button.callback(getButtonFromCallbackType(CallbackType.Lineup), CallbackType.Lineup),
  ]),
};
