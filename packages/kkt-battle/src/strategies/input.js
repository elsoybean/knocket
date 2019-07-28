//@flow

// $FlowFixMe - events does in fact export once
import EventEmitter, { once } from 'events';

import type { Move } from '../../types/Move.types';

const input = ({
  events,
}: {
  events?: EventEmitter,
}) => async (): Promise<?Move> => {
  if (!events) {
    return;
  }

  const [command, ...options] = await once(events, 'input');

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
