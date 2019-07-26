//@flow

import type { Point } from '../../types/GameState.types';

const initializeField = (size: number): Array<Point> => {
  const field: Array<Point> = [];
  const min = -1 * (size - 1);
  for (let x = -1 * (size - 1); x < size; x++) {
    for (let y = Math.max(min, min - x); y < size; y++) {
      const z = 0 - x - y;
      if (z >= min && z < size) {
        field.push({ x, y, z });
      }
    }
  }
  return field;
};

export default initializeField;
