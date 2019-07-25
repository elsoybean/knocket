//@flow

import type { Point } from '../../types/GameState.types';

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const clear = () => process.stdout.write('\u001b[2J\u001b[0;0H');

const addPoints = (a: Point, b: Point): Point => ({
  x: a.x + b.x,
  y: a.y + b.y,
  z: a.z + b.z,
});

const areEqual = (a: Point, b: Point): boolean =>
  a.x == b.x && a.y == b.y && a.z == b.z;

export { sleep, clear, addPoints, areEqual };
