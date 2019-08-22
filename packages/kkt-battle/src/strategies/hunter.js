//@flow

import _ from 'lodash';
import { HEADINGS } from 'kkt-common';

import type { SensorData } from '../../types/GameState.types';
import type { Move } from '../../types/Move.types';

const hunter = () => async (
  sensorData: SensorData,
  final: boolean,
): Promise<?Move> => {
  if (final) {
    return;
  }

  const { proximity = [], heading, compass } = sensorData;
  const facing = proximity.find((p) =>
    _.isEqual(p.location, HEADINGS[heading]),
  );

  const clockwise = !!(Math.random() < 0.5);

  if (facing && facing.type == 'bot') {
    if (facing.damage != 'total') {
      return { type: 'attack' };
    } else {
      return { type: 'rotate', options: { clockwise } };
    }
  }

  if (compass[0]) {
    return { type: 'ahead' };
  }
  if (compass[1] || compass[2]) {
    return { type: 'rotate', options: { clockwise: true } };
  }
  if (compass[5] || compass[4]) {
    return { type: 'rotate', options: { clockwise: false } };
  }
  return { type: 'rotate', options: { clockwise } };
};

export default hunter;
