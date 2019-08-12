//@flow

import EventEmitter from 'events';

import type { Move } from '../../types/Move.types';

const offline = ({ events }: { events?: EventEmitter }) => async (
  sensorData: SensorData,
  final: boolean,
): Promise<?Move> => {
  if (!events || final) {
    return;
  }

  events.emit('pause', sensorData);
};

export default offline;
