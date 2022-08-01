import { sampleSize } from 'lodash';

import envConfig from '../../config/env';
import { UserWithCountBenched } from '../../db/getUsersWithCountBenched';

// Types

type NormalizeNumberInput = {
  max: number;
  min: number;
};

const createCreateWeights = ({ max, min }: NormalizeNumberInput) => (val: number) => {
  const delta = max - min;

  if (delta === 0) {
    return 0;
  }

  const weight = (val - min) / delta;

  return weight;
};

const weight = (users: UserWithCountBenched[]): UserWithCountBenched[] => {
  const maxBenchedCount = Math.max(...users.map(player => player.countBenched));
  const minBenchedCount = Math.min(...users.map(player => player.countBenched));

  const createWeights = createCreateWeights({ max: maxBenchedCount, min: minBenchedCount });

  const weightedPlayers = users.map(player => ({ ...player, weight: createWeights(player.countBenched) }));

  // Based on: https://observablehq.com/@nextlevelshit/rejection-sampling-in-javascript
  return weightedPlayers.flatMap(player => Array(Math.ceil(player.weight * 100)).fill(player));
};

const getWeightedSample = (users: UserWithCountBenched[], size = 1) => {
  const weighted = weight(users);

  return sampleSize(weighted, size);
};

export default getWeightedSample;
