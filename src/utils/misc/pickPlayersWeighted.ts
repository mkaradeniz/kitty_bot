import weightedRandomObject from 'weighted-random-object';

import { UserWithCountBenched } from '../../db/getUsersWithCountBenched';

type CreateGetWeightInput = {
  max: number;
  min: number;
};

const createGetWeight = ({ max, min }: CreateGetWeightInput) => (value: number) => {
  const delta = max - min;

  if (delta === 0) {
    return 0;
  }

  const weight = (value - min) / delta;

  return weight;
};

// Recursive!
const pickPlayersWeighted = (users: UserWithCountBenched[], size = 8, pickedUsers: UserWithCountBenched[] = []): UserWithCountBenched[] => {
  if (size === 0) {
    return pickedUsers;
  }

  const maxBenchedCount = Math.max(...users.map(player => player.countBenched));
  const minBenchedCount = Math.min(...users.map(player => player.countBenched));

  const getWeight = createGetWeight({ max: maxBenchedCount, min: minBenchedCount });

  const weightedUsers = users.map(user => ({ ...user, weight: getWeight(user.countBenched) }));

  const pickedUser = weightedRandomObject(weightedUsers);

  const nextPickedUsers = [...pickedUsers, pickedUser];
  const nextSize = size - 1;
  const nextUsers = users.filter(user => user.id !== pickedUser.id);

  return pickPlayersWeighted(nextUsers, nextSize, nextPickedUsers);
};

export default pickPlayersWeighted;
