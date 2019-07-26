//@flow

import type { Heading } from '../../types/GameState.types';

const HEADINGS: Array<Heading> = [
  { x: -1, y: 0, z: 1 },
  { x: -1, y: 1, z: 0 },
  { x: 0, y: 1, z: -1 },
  { x: 1, y: 0, z: -1 },
  { x: 1, y: -1, z: 0 },
  { x: 0, y: -1, z: 1 },
];

export { HEADINGS };
