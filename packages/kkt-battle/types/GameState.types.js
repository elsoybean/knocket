//@flow

import EventEmitter from 'events';

export type Point = {
  x: number,
  y: number,
  z: number,
};

export type Heading = Point;

export type StrategyConfig = {
        type: string,
        options?: Object,
    };

export type Bot = {
  id: string,
  position: Point,
  heading: number,
  strategy: (sensorData: SensorData) => Promise<?HistoryItem>,
  strategyConfig: StrategyConfig,
  color: string,
  cooldown: number,
  health: number,
  sensorMemory: Array<SensorReading>,
  defending: boolean,
  moveHistory: Array<HistoryItem>,
};

export type BotConfig = {
    color: string,
    strategy: StrategyConfig,
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
  | { type: 'initialState', state: GameState }
);

export type GameConfig = {
    fieldSize: number,
    botConfigs: Array<BotConfig>,
};

export type RenderFunction = (GameState) => Promise<void>;

export type Frontend = {
    events: EventEmitter,
    render: RenderFunction,
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
  compass: Array<boolean>,
};

export type DamageRecord = { type: 'attack', dealt: boolean };

export type SensorData = SensorReading & { previousReadings: Array<SensorReading>, damages: Array<DamageRecord> };

export type SavedGame = { sensorData?: SensorData, state: GameState };