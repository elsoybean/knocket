//@flow

import type { Move } from './Move.types';

export type Point = {
  x: number,
  y: number,
  z: number,
};

export type Heading = Point & { c: string };

export type Bot = {
  position: Point,
  heading: number,
  strategy: () => Promise<?Move>,
  color: string,
};

export type GameState = {
  bots: Array<Bot>,
  field: Array<Point>,
};
