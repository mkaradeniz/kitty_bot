import prisma from '@db-prisma/prisma';

import { logger } from '@utils/logger/logger';

type CreatePlayerInput = {
  firstName: string;
  telegramId: number;
};

export const createPlayer = async ({ firstName, telegramId }: CreatePlayerInput) => {
  const createdPlayer = await prisma.player.create({ data: { firstName, telegramId } });

  logger.silly(`Created player: \`${telegramId}\`.`, { label: 'src/db/createPlayer.ts:12' });

  return createdPlayer;
};
