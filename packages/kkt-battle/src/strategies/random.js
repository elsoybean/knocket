//@flow

import type { Move } from '../../types/Move.types';

const random = () => async (): Promise<?Move> => {
  const n = Math.random();
  if (n < 0.25) {
    return { type: 'rotate', options: { clockwise: true } };
  }
  if (n < 0.5) {
    return { type: 'rotate', options: { clockwise: false } };
  }
  return { type: 'ahead' };
};

export default random;
