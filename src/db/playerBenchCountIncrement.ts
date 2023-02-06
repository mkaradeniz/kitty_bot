import arrayify from '../utils/misc/arrayify';
import isNotNullOrUndefined from '../utils/misc/isNotNullOrUndefined';
import prisma from '../../prisma/prisma';

// Types
import { User } from 'telegraf/typings/core/types/typegram';

const playerBenchCountIncrement = async (users: User | User[]) => {
  const telegramIds = arrayify(users).map(user => user.id);

  for (const telegramId of telegramIds) {
    const player = await prisma.player.findUnique({ select: { countBenched: true }, where: { telegramId } });

    if (!isNotNullOrUndefined(player)) {
      continue;
    }

    await prisma.player.update({ data: { countBenched: player.countBenched + 1 }, where: { telegramId } });
  }
};

export default playerBenchCountIncrement;
