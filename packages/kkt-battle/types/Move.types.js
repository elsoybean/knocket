//@flow

import type { SensorData } from './GameState.types';

export type AheadOptions = void;

export type RotateOptions = { clockwise?: boolean };

export type AttackOptions = void;

export type CollectOptions = { handle: string, sensorData: SensorData };

export type Move =
    | { type: 'ahead', options?: AheadOptions }
    | { type: 'rotate', options?: RotateOptions }
    | { type: 'attack', options?: AttackOptions }
    | { type: 'collect', options?: CollectOptions };
