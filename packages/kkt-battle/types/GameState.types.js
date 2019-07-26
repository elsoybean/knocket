//@flow

import type { Move } from './Move.types';

export type Point = {
  x: number,
  y: number,
  z: number,
};

export type Heading = Point;

export type Bot = {
  position: Point,
  heading: number,
  strategy: () => Promise<?Move>,
  color: string,
  cooldown: number,
  health: number,
};

export type BotConfig = {
    color: string,
    strategy: {
        type: string,
        options?: Object,
    }
};

export type Field = Array<Point>;

export type GameState = {
  bots: Array<Bot>,
  field: Field,
};
