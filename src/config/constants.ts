import { Markup } from 'telegraf';

import getButtonFromCallbackType from '@utils/misc/getButtonFromCallbackType';

// Types
import { CallbackType } from '@types';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

export const BUTTONS_TUTORIAL: ExtraReplyMessage = {
  ...Markup.inlineKeyboard([
    Markup.button.callback(getButtonFromCallbackType(CallbackType.Confirm), CallbackType.Confirm),
    Markup.button.callback(getButtonFromCallbackType(CallbackType.Unconfirm), CallbackType.Unconfirm),
    Markup.button.callback(getButtonFromCallbackType(CallbackType.Lineup), CallbackType.Lineup),
  ]),
};
