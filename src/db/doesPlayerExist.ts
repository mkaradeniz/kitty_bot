import prisma from '@db-prisma/prisma';

export const doesPlayerExist = async (telegramId: number) => {
  const count = await prisma.player.count({ where: { telegramId } });

  return count > 0;
};
