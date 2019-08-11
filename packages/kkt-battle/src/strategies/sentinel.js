//@flow

import _ from 'lodash';
import { HEADINGS } from '../constants';

import type { SensorData } from '../../types/GameState.types';
import type { Move } from '../../types/Move.types';

const sentinel = () => {
  const clockwise = !!(Math.random() < 0.5);
  return async (sensorData: SensorData, final: boolean): Promise<?Move> => {
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
    return { type: 'rotate', options: { clockwise } };
  };
};

export default sentinel;
