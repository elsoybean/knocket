//@flow

import _ from 'lodash';
import { HEADINGS } from 'kkt-common';

import type { SensorData } from '../../types/GameState.types';
import type { Move } from '../../types/Move.types';

const rotate = () => ({
  type: 'rotate',
  options: { clockwise: !!(Math.random() < 0.5) },
});

const explorer = () => async (
  sensorData: SensorData,
  final: boolean,
): Promise<?Move> => {
  if (final) {
    return;
  }

  const { proximity = [], heading } = sensorData;
  const facing = proximity.find((p) =>
    _.isEqual(p.location, HEADINGS[heading]),
  );

  if (facing && facing.type == 'bot' && facing.damage != 'total') {
    return { type: 'attack' };
  }

  if (facing && (facing.type == 'wall' || facing.type == 'bot')) {
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

export default explorer;
