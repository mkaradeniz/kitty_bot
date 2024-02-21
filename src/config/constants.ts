import { Markup } from 'telegraf';
import { type ExtraReplyMessage } from 'telegraf/typings/telegram-types';

import { getButtonFromCallbackType } from '@utils/misc/getButtonFromCallbackType';

import { CallbackType } from '@app-types/app';

export const BUTTONS_TUTORIAL: ExtraReplyMessage = {
  ...Markup.inlineKeyboard([
    Markup.button.callback(getButtonFromCallbackType(CallbackType.Confirm), CallbackType.Confirm),
    Markup.button.callback(getButtonFromCallbackType(CallbackType.Unconfirm), CallbackType.Unconfirm),
    Markup.button.callback(getButtonFromCallbackType(CallbackType.Lineup), CallbackType.Lineup),
  ]),
};
