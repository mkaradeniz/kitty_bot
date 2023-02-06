import prisma from '../../prisma/prisma';

const createPlayer = async (telegramId: number) => {
  const createdPlayer = await prisma.player.create({ data: { telegramId } });

  return createdPlayer;
};

export default createPlayer;
