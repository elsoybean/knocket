//@flow

import type { Heading } from '../../types/GameState.types';

const HEADINGS: Array<Heading> = [
  { x: -1, y: 0, z: 1, c: '↖' },
  { x: -1, y: 1, z: 0, c: '↗' },
  { x: 0, y: 1, z: -1, c: '→' },
  { x: 1, y: 0, z: -1, c: '↘' },
  { x: 1, y: -1, z: 0, c: '↙' },
  { x: 0, y: -1, z: 1, c: '←' },
];

const HEADING_ARROWS: Array<string> = ['↖', '↗', '→', '↘', '↙', '←'];

export { HEADINGS, HEADING_ARROWS };
