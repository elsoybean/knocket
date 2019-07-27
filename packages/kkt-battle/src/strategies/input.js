//@flow

// $FlowFixMe - events does in fact export once
import EventEmitter, { once } from 'events';

import type { Move } from '../../types/Move.types';
import type { SensorData } from '../../types/GameState.types';

const input = ({
  inputEventEmitter,
}: {
  inputEventEmitter?: EventEmitter,
}) => async (sensorData: SensorData): Promise<?Move> => {
  if (!inputEventEmitter) {
    return;
  }

  console.log(JSON.stringify(sensorData));

  const [command, ...options] = await once(inputEventEmitter, 'input');

  if (command === 'ahead') {
    return { type: 'ahead' };
  }
  if (command === 'attack') {
    return { type: 'attack' };
  }
  if (command === 'rotate') {
    const [clockwise]: [boolean] = options;
    return { type: 'rotate', options: { clockwise } };
  }
};

export default input;
