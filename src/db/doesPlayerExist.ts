import prisma from '@prisma/prisma';

const doesPlayerExist = async (telegramId: number) => {
  const count = await prisma.player.count({ where: { telegramId } });

  return count > 0;
};

export default doesPlayerExist;
