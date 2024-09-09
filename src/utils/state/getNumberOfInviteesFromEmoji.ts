export const getNumberOfInviteesFromEmoji = (emoji?: string | null) => {
  switch (emoji) {
    // Some clients, for example Telegram on Android, don't send the unified emoji from the built-in keyboard, but the number and the enclosing keycap symbol.
    case '0⃣':
    case '0️⃣': {
      return 0;
    }

    case '1⃣':
    case '1️⃣': {
      return 1;
    }

    case '2⃣':
    case '2️⃣': {
      return 2;
    }

    case '3⃣':
    case '3️⃣': {
      return 3;
    }

    case '4⃣':
    case '4️⃣': {
      return 4;
    }

    case '5⃣':
    case '5️⃣': {
      return 5;
    }

    case '6⃣':
    case '6️⃣': {
      return 6;
    }

    case '7⃣':
    case '7️⃣': {
      return 7;
    }

    case '8⃣':
    case '8️⃣': {
      return 8;
    }

    default: {
      return -1;
    }
  }
};
