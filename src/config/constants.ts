import { Markup } from 'telegraf';

import {
  EMOJI_CONFIRM,
  EMOJI_DECLINE,
  EMOJI_EMAIL,
  EMOJI_EMAIL_CANCEL,
  EMOJI_GUESTS_0,
  EMOJI_GUESTS_1,
  EMOJI_GUESTS_2,
  EMOJI_LINEUP,
} from './texts';

// Types
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

export const CALLBACK_TYPE_BENCH = 'CALLBACK_TYPE_BENCH';
export const CALLBACK_TYPE_CONFIRM = 'CALLBACK_TYPE_CONFIRM';
export const CALLBACK_TYPE_CONFIRM_GUESTS_0 = 'CALLBACK_TYPE_CONFIRM_GUESTS_0';
export const CALLBACK_TYPE_CONFIRM_GUESTS_1 = 'CALLBACK_TYPE_CONFIRM_GUESTS_1';
export const CALLBACK_TYPE_CONFIRM_GUESTS_2 = 'CALLBACK_TYPE_CONFIRM_GUESTS_2';
export const CALLBACK_TYPE_LINEUP = 'CALLBACK_TYPE_LINEUP';
export const CALLBACK_TYPE_LOTTERY = 'CALLBACK_TYPE_LOTTERY';
export const CALLBACK_TYPE_RESET_STATE = 'CALLBACK_TYPE_RESET_STATE';
export const CALLBACK_TYPE_SEND_EMAIL = 'CALLBACK_TYPE_SEND_EMAIL';
export const CALLBACK_TYPE_SEND_EMAIL_CANCEL = 'CALLBACK_TYPE_SEND_EMAIL_CANCEL';
export const CALLBACK_TYPE_UNCONFIRM = 'CALLBACK_TYPE_UNCONFIRM';

export const BUTTONS_DEV: ExtraReplyMessage = {
  ...Markup.inlineKeyboard(
    [
      Markup.button.callback(EMOJI_CONFIRM, CALLBACK_TYPE_CONFIRM),
      Markup.button.callback(EMOJI_DECLINE, CALLBACK_TYPE_UNCONFIRM),
      Markup.button.callback(EMOJI_LINEUP, CALLBACK_TYPE_LINEUP),
      Markup.button.callback(EMOJI_GUESTS_0, CALLBACK_TYPE_CONFIRM_GUESTS_0),
      Markup.button.callback(EMOJI_GUESTS_1, CALLBACK_TYPE_CONFIRM_GUESTS_1),
      Markup.button.callback(EMOJI_GUESTS_2, CALLBACK_TYPE_CONFIRM_GUESTS_2),
      Markup.button.callback('!reset', CALLBACK_TYPE_RESET_STATE),
      Markup.button.callback(EMOJI_EMAIL, CALLBACK_TYPE_SEND_EMAIL),
      Markup.button.callback(EMOJI_EMAIL_CANCEL, CALLBACK_TYPE_SEND_EMAIL_CANCEL),
    ],
    { columns: 3 },
  ),
};

export const BUTTONS_TUTORIAL: ExtraReplyMessage = {
  ...Markup.inlineKeyboard([
    Markup.button.callback(EMOJI_CONFIRM, CALLBACK_TYPE_CONFIRM),
    Markup.button.callback(EMOJI_DECLINE, CALLBACK_TYPE_UNCONFIRM),
    Markup.button.callback(EMOJI_LINEUP, CALLBACK_TYPE_LINEUP),
  ]),
};
