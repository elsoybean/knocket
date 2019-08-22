//@flow

import _ from 'lodash';
import { HEADINGS } from 'kkt-common';

import type { SensorData } from '../../types/GameState.types';
import type { Move } from '../../types/Move.types';

const facer = () => async (
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

  if (facing && facing.type == 'bot' && facing.damage != 'total') {
    return { type: 'attack' };
  }

  if (compass[0]) {
    return { type: 'defend' };
  }
  if (compass[1] || compass[2]) {
    return { type: 'rotate', options: { clockwise: true } };
  }
  if (compass[5] || compass[4]) {
    return { type: 'rotate', options: { clockwise: false } };
  }
  const clockwise = !!(Math.random() < 0.5);
  return { type: 'rotate', options: { clockwise } };
};

export default facer;
