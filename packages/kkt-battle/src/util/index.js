//@flow

import type { Point } from '../../types/GameState.types';

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const addPoints = (a: Point, b: Point): Point => ({
  x: a.x + b.x,
  y: a.y + b.y,
  z: a.z + b.z,
});

const areEqual = (a: Point, b: Point): boolean =>
  a.x == b.x && a.y == b.y && a.z == b.z;

export { sleep, addPoints, areEqual };
