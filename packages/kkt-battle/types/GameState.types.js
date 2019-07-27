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
  sensorMemory: Array<SensorReading>,
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

export type ProximityReadingType = 'bot' | 'wall' | 'nothing';

export type ProximityReading = {
  location: Point,
  type: ProximityReadingType,
  damage?: DamageEstimate,
};

export type DamageEstimate = 'none' | 'minor' | 'major' | 'total';

export type SensorReading = {
  elapsed: number,
  proximity: Array<ProximityReading>,
  damage: DamageEstimate,
  heading: Heading,
};

export type SensorData = SensorReading & { history: Array<SensorReading> };