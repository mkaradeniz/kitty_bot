import prisma from '../../prisma/prisma';

// Types
import { User } from 'telegraf/typings/core/types/typegram';

export type UserWithCountBenched = {
  countBenched: number;
} & User;

const getUsersWithCountBenched = async (users: User[]) => {
  const userIds = users.map(user => user.id);

  const playersWithCountBenched = await prisma.player.findMany({
    select: { countBenched: true, firstName: true, telegramId: true },
    where: { telegramId: { in: userIds } },
  });

  const usersWithCountBenched = users.map(user => {
    return {
      ...user,
      countBenched: playersWithCountBenched.find(player => player.telegramId === BigInt(user.id))?.countBenched ?? 0,
    };
  });

  return usersWithCountBenched;
};

export default getUsersWithCountBenched;
