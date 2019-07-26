//@flow

import type { Move } from '../../types/Move.types';

const random = () => async (): Promise<?Move> => {
  const n = 6 * Math.random();
  if (n < 1) {
    return { type: 'rotate', options: { clockwise: true } };
  }
  if (n < 2) {
    return { type: 'rotate', options: { clockwise: false } };
  }
  if (n < 4) {
    return { type: 'attack' };
  }
  return { type: 'ahead' };
};

export default random;
