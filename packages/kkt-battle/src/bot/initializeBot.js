//@flow

import { v4 as uuid } from 'uuid';
import * as strategies from '../strategies';

import type EventEmitter from 'events';
import type { Bot, BotConfig, Field } from '../../types/GameState.types';

const initializeBot = (
  field: Field,
  config: BotConfig,
  events: EventEmitter,
): Bot => {
  const {
    color,
    strategy: { type: strategyType, options: strategyOptions } = {},
  } = config;

  const heading = Math.floor(Math.random() * 6);
  const position = field[Math.floor(Math.random() * field.length)];
  const allOptions: Object = {
    ...strategyOptions,
    events,
  };
  const strategy = strategies[strategyType](allOptions);
  const cooldown = Math.random() * 3;
  const defending = false;
  const health = 99;
  const id = uuid();

  return {
    id,
    color,
    defending,
    strategy,
    heading,
    position,
    cooldown,
    health,
    sensorMemory: [],
    moveHistory: [],
  };
};

export default initializeBot;
