//@flow

// $FlowFixMe - events does in fact export once
import EventEmitter, { once } from 'events';

import type { Move } from '../../types/Move.types';

const input = ({
  inputEventEmitter,
}: {
  inputEventEmitter?: EventEmitter,
}) => async (): Promise<?Move> => {
  if (!inputEventEmitter) {
    return;
  }

  const [command, ...options] = await once(inputEventEmitter, 'input');

  if (command === 'ahead') {
    return { type: 'ahead' };
  }
  if (command === 'rotate') {
    const [clockwise]: [boolean] = options;
    return { type: 'rotate', options: { clockwise } };
  }
};

export default input;
