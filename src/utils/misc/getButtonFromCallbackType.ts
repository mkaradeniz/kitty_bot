import { CallbackType, Emoji } from '../../types/app';

export const getButtonFromCallbackType = (callbackType: CallbackType): string => {
  switch (callbackType) {
    case CallbackType.Bench: {
      return Emoji.PlayerBenched;
    }

    case CallbackType.Confirm: {
      return Emoji.Confirm;
    }

    case CallbackType.ConfirmGuests0: {
      return Emoji.Guests0;
    }

    case CallbackType.ConfirmGuests1: {
      return Emoji.Guests1;
    }

    case CallbackType.ConfirmGuests2: {
      return Emoji.Guests2;
    }

    case CallbackType.Lineup: {
      return Emoji.Lineup;
    }

    case CallbackType.Lottery: {
      return Emoji.Lottery;
    }

    case CallbackType.ResetState: {
      return Emoji.ResetState;
    }

    case CallbackType.SendBookingEmail: {
      return Emoji.EmailBook;
    }

    case CallbackType.SendCancelEmail: {
      return Emoji.EmailCancel;
    }

    case CallbackType.Unconfirm: {
      return Emoji.Decline;
    }
  }
};
