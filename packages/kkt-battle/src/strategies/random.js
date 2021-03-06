//@flow

import type { Move } from '../../types/Move.types';

const random = () => async (
  sensorData: SensorData,
  final: boolean,
): Promise<?Move> => {
  if (final) {
    return;
  }
  const actions = ['rotate', 'attack', 'ahead', 'defend', 'reverse', 'wait'];
  const available = actions.filter((a) => !!a);

  const n = Math.floor(available.length * Math.random());
  if (available[n] == 'rotate') {
    return { type: 'rotate', options: { clockwise: Math.random() < 0.5 } };
  }
  return { type: available[n] };
};

export default random;
