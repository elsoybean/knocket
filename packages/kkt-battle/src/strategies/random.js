//@flow

import type { Move } from '../../types/Move.types';

const random = () => async (
  sensorData: SensorData,
  final: boolean,
): Promise<?Move> => {
  if (final) {
    return;
  }
  const n = 5 * Math.random();
  if (n < 1) {
    return { type: 'rotate', options: { clockwise: true } };
  }
  if (n < 2) {
    return { type: 'rotate', options: { clockwise: false } };
  }
  if (n < 3) {
    return { type: 'attack' };
  }
  if (n < 4) {
    return { type: 'ahead' };
  }
  return { type: 'wait' };
};

export default random;
