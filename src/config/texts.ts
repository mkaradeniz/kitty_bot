import pluralize from 'pluralize';
import envConfig from './env';

export const CONFIRM_EMOJI = '👍';
export const DECLINE_EMOJI = '👎';
export const LINEUP_EMOJI = '📜';
export const LOTTERY_EMOJI = '🍀';
export const NEGATIVE_EMOJI = '😪';
export const PLAYER_BENCHED_EMOJI = '🪑';
export const PLAYER_OUT_EMOJI = '🧂';
export const POSITIVE_EMOJI = '🍺';
export const TEAM_EMOJI = '🥒🐭';

export const LINEUP_COMPLETE = `🍻 We did it! Our lineup is complete! 🍻`;

export const BENCH_YOURSELF = `If you're one of the lucky ones who got picked this week, but want to bench yourself in favor of a another player. Send a ${PLAYER_BENCHED_EMOJI} or click on the button below.`;

export const OVERBOOKED = `⚠️ We're overbooked! ⚠️
We have to pick <b>${envConfig.maxPlayers}</b> ${pluralize('player', envConfig.maxPlayers)} from everyone who confirmed.
Send a ${LOTTERY_EMOJI} or click on the button below to peform the lottery.`;

export const TUTORIAL = `Send a ${CONFIRM_EMOJI} if you're in\n
Send a ${DECLINE_EMOJI} if you're out.\n
If you're bringing others, post how many with 1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣8️⃣.\n
Write <code>/lineup</code> or send a ${LINEUP_EMOJI} to see this weeks lineup.\n
You can also use the buttons below this message.\n
`;
