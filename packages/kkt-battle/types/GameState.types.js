//@flow

import type { Move } from './Move.types';
import EventEmitter from 'events';

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
  elapsed: number,
  bots: Array<Bot>,
  field: Field,
};

export type GameConfig = {
    fieldSize: number,
    botConfigs: Array<BotConfig>,
};

export type Frontend = {
    events: EventEmitter,
    render: (GameState) => Promise<void>,
};

export type BattleOptions = {
    gameConfig: GameConfig,
    frontend: Frontend,
};
