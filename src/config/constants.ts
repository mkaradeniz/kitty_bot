import { Markup } from 'telegraf';

import { EMOJI_CONFIRM, EMOJI_DECLINE, EMOJI_LINEUP } from './texts';

// Types
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

export const CALLBACK_TYPE_BENCH = 'CALLBACK_TYPE_BENCH';
export const CALLBACK_TYPE_CONFIRM = 'CALLBACK_TYPE_CONFIRM';
export const CALLBACK_TYPE_LINEUP = 'CALLBACK_TYPE_LINEUP';
export const CALLBACK_TYPE_LOTTERY = 'CALLBACK_TYPE_LOTTERY';
export const CALLBACK_TYPE_SEND_EMAIL = 'CALLBACK_TYPE_SEND_EMAIL';
export const CALLBACK_TYPE_UNCONFIRM = 'CALLBACK_TYPE_UNCONFIRM';

export const BUTTONS_TUTORIAL: ExtraReplyMessage = {
  ...Markup.inlineKeyboard([
    Markup.button.callback(EMOJI_CONFIRM, CALLBACK_TYPE_CONFIRM),
    Markup.button.callback(EMOJI_DECLINE, CALLBACK_TYPE_UNCONFIRM),
    Markup.button.callback(EMOJI_LINEUP, CALLBACK_TYPE_LINEUP),
  ]),
};
