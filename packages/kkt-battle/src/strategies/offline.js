//@flow

import type { Move } from '../../types/Move.types';

const offline = ({ handle }: { handle?: string }) => async (
  sensorData: SensorData,
  final: boolean,
): Promise<?Move> => {
  if (!handle || final) {
    return;
  }

  return { type: 'collect', options: { handle, sensorData } };
};

export default offline;
