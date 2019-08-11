//@flow

import type { Move } from '../../types/Move.types';

const lump = () => async (
  sensorData: SensorData,
  final: boolean,
): Promise<?Move> => {
  if (final) {
    return;
  }
  return { type: 'wait' };
};

export default lump;
