//@flow

import * as strategies from '../strategies';

import type EventEmitter from 'events';
import type { Bot, BotConfig, Field } from '../../types/GameState.types';

const initializeBot = (
  field: Field,
  config: BotConfig,
  inputEventEmitter: EventEmitter,
): Bot => {
  const {
    color,
    strategy: { type: strategyType, options: strategyOptions } = {},
  } = config;

  const heading = Math.floor(Math.random() * 6);
  const position = field[Math.floor(Math.random() * field.length)];
  const allOptions: Object = {
    ...strategyOptions,
    inputEventEmitter,
  };
  const strategy = strategies[strategyType](allOptions);
  const cooldown = Math.random() * 3;

  return {
    color,
    strategy,
    heading,
    position,
    cooldown,
  };
};

export { initializeBot };
