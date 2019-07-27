//@flow

import _ from 'lodash';

import type { SensorData } from '../../types/GameState.types';
import type { Move } from '../../types/Move.types';

const rotate = () => ({
  type: 'rotate',
  options: { clockwise: !!(Math.random() < 0.5) },
});

const random = () => async (sensorData: SensorData): Promise<?Move> => {
  const { proximity = [], heading } = sensorData;
  const facing = proximity.find((p) => _.isEqual(p.location, heading));

  if (facing && facing.type == 'bot' && facing.damage != 'total') {
    return { type: 'attack' };
  }

  if (
    facing &&
    (facing.type == 'wall' ||
      (facing.type == 'bot' && facing.damage == 'total'))
  ) {
    return rotate();
  }

  const otherBots = proximity.filter(
    (p) => p.type == 'bot' && p.damage != 'total',
  );
  if (otherBots.length > 0 || Math.random() < 0.5) {
    return rotate();
  }

  return { type: 'ahead' };
};

export default random;
