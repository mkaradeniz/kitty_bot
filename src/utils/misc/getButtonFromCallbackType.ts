import {
  EMOJI_CONFIRM,
  EMOJI_DECLINE,
  EMOJI_EMAIL_BOOK,
  EMOJI_EMAIL_CANCEL,
  EMOJI_GUESTS_0,
  EMOJI_GUESTS_1,
  EMOJI_GUESTS_2,
  EMOJI_LINEUP,
  EMOJI_LOTTERY,
  EMOJI_PLAYER_BENCHED,
  EMOJI_RESET_STATE,
} from '@config/texts';

// Types
import { CallbackType } from '@types';

const getButtonFromCallbackType = (callbackType: CallbackType): string => {
  switch (callbackType) {
    case CallbackType.Bench: {
      return EMOJI_PLAYER_BENCHED;
    }

    case CallbackType.Confirm: {
      return EMOJI_CONFIRM;
    }

    case CallbackType.ConfirmGuests0: {
      return EMOJI_GUESTS_0;
    }

    case CallbackType.ConfirmGuests1: {
      return EMOJI_GUESTS_1;
    }

    case CallbackType.ConfirmGuests2: {
      return EMOJI_GUESTS_2;
    }

    case CallbackType.Lineup: {
      return EMOJI_LINEUP;
    }

    case CallbackType.Lottery: {
      return EMOJI_LOTTERY;
    }

    case CallbackType.ResetState: {
      return EMOJI_RESET_STATE;
    }

    case CallbackType.SendBookingEmail: {
      return EMOJI_EMAIL_BOOK;
    }

    case CallbackType.SendCancelEmail: {
      return EMOJI_EMAIL_CANCEL;
    }

    case CallbackType.Unconfirm: {
      return EMOJI_DECLINE;
    }
  }
};

export default getButtonFromCallbackType;
