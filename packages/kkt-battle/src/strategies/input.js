//@flow

// $FlowFixMe - events does in fact export once
import EventEmitter, { once } from 'events';

import type { Move } from '../../types/Move.types';

const input = ({ events }: { events?: EventEmitter }) => async (
  sensorData: SensorData,
  final: boolean,
): Promise<?Move> => {
  if (!events || final) {
    return;
  }

  const [command, ...options] = await once(events, 'input');

  if (command === 'ahead') {
    return { type: 'ahead' };
  }
  if (command === 'attack') {
    return { type: 'attack' };
  }
  if (command === 'reverse') {
    return { type: 'reverse' };
  }
  if (command === 'defend') {
    return { type: 'defend' };
  }
  if (command === 'rotate') {
    const [clockwise]: [boolean] = options;
    return { type: 'rotate', options: { clockwise } };
  }
};

export default input;
