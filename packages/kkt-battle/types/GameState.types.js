//@flow

import EventEmitter from 'events';
import type { Move } from './Move.types';

export type Point = {
  x: number,
  y: number,
  z: number,
};

export type Heading = Point;

export type Bot = {
  id: string,
  position: Point,
  heading: number,
  strategy: (sensorData: SensorData) => Promise<?HistoryItem>,
  color: string,
  cooldown: number,
  health: number,
  sensorMemory: Array<SensorReading>,
  defending: boolean,
  moveHistory: Array<HistoryItem>,
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
  steps: number,
  bots: Array<Bot>,
  field: Field,
  history: Array<HistoryItem>,
};

export type HistoryItem = {
  botId: string,
  elapsed: number,
} & (
  | { type: 'wait' }
  | { type: 'ahead' }
  | { type: 'rotate', clockwise: boolean }
  | { type: 'attack', target?: string, damage: number }
  | { type: 'checkpoint', state: GameState }
);

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
    state: GameState,
    move: Move,
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
  compass: Array<boolean>,
};

export type DamageRecord = { type: 'attack', dealt: boolean };

export type SensorData = SensorReading & { previousReadings: Array<SensorReading>, damages: Array<DamageRecord> };