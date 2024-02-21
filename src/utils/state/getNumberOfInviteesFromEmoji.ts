export const getNumberOfInviteesFromEmoji = (emoji?: string | null) => {
  switch (emoji) {
    case '0️⃣': {
      return 0;
    }

    case '1️⃣': {
      return 1;
    }

    case '2️⃣': {
      return 2;
    }

    case '3️⃣': {
      return 3;
    }

    case '4️⃣': {
      return 4;
    }

    case '5️⃣': {
      return 5;
    }

    case '5️⃣': {
      return 5;
    }

    case '6️⃣': {
      return 6;
    }

    case '7️⃣': {
      return 7;
    }

    case '8️⃣': {
      return 8;
    }

    default: {
      return -1;
    }
  }
};
