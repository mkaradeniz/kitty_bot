import pluralize from 'pluralize';
import envConfig from './env';

export const CONFIRM_EMOJI = '👍';
export const DECLINE_EMOJI = '👎';
export const LINEUP_EMOJI = '📜';
export const LOTTERY_EMOJI = '🍀';
export const PLAYER_OUT_EMOJI = '🧂';
export const PLAYER_REJECTED_EMOJI = '😪';

export const LINEUP_COMPLETE = `🍻 We did it! Our lineup is complete! 🍻`;

export const OVERBOOKED = `⚠️ We're overbooked! ⚠️
We have to pick <b>${envConfig.maxPlayers}</b> ${pluralize('player', envConfig.maxPlayers)} from everyone who confirmed.
Send a ${LOTTERY_EMOJI} or click on the button below to peform the lottery.`;

export const TUTORIAL = `Send a ${CONFIRM_EMOJI} if you're in\n
Send a ${DECLINE_EMOJI} if you're out.\n
If you're bringing others, post how many with 1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣8️⃣.\n
Write <code>/lineup</code> or send a ${LINEUP_EMOJI} to see this weeks lineup.\n
You can also use the buttons below this message.\n
`;
