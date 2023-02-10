import weightedRandomObject from 'weighted-random-object';

// Types
import { Player } from '@prisma/client';

type CreateGetWeightInput = {
  max: number;
  min: number;
};

const createGetWeight =
  ({ max, min }: CreateGetWeightInput) =>
  (value: number) => {
    const delta = max - min;

    if (delta === 0) {
      return 0;
    }

    const weight = (value - min) / delta;

    return weight;
  };

// ! Recursive
const pickPlayersWeighted = (players: Player[], size = 8, pickedPlayers: Player[] = []): Player[] => {
  if (size === 0) {
    return pickedPlayers;
  }

  const maxBenchedCount = Math.max(...players.map(player => player.countBenched));
  const minBenchedCount = Math.min(...players.map(player => player.countBenched));

  const getWeight = createGetWeight({ max: maxBenchedCount, min: minBenchedCount });

  const weightedUsers = players.map(user => ({ ...user, weight: getWeight(user.countBenched) }));

  const pickedUser = weightedRandomObject(weightedUsers);

  const nextPickedUsers = [...pickedPlayers, pickedUser];
  const nextSize = size - 1;
  const nextUsers = players.filter(user => user.id !== pickedUser.id);

  return pickPlayersWeighted(nextUsers, nextSize, nextPickedUsers);
};

export default pickPlayersWeighted;
