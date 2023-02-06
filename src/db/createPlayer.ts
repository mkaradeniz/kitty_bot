import prisma from '../../prisma/prisma';

type CreatePlayerInput = {
  firstName: string;
  telegramId: number;
};

const createPlayer = async ({ firstName, telegramId }: CreatePlayerInput) => {
  const createdPlayer = await prisma.player.create({ data: { firstName, telegramId } });

  return createdPlayer;
};

export default createPlayer;
