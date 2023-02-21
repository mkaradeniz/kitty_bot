import logger from '../utils/logger';
import prisma from '../../prisma/prisma';

type CreatePlayerInput = {
  firstName: string;
  telegramId: number;
};

const createPlayer = async ({ firstName, telegramId }: CreatePlayerInput) => {
  const createdPlayer = await prisma.player.create({ data: { firstName, telegramId } });

  logger.silly(`Created player: \`${telegramId}\`.`, { label: 'src/db/createPlayer.ts:12' });

  return createdPlayer;
};

export default createPlayer;
