//@flow

import { v4 as uuid } from 'uuid';
import * as strategies from '../strategies';

import type EventEmitter from 'events';
import type { Bot, BotConfig, Field } from '../../types/GameState.types';

const initializeBot = (
  field: Field,
  startPositions: Array<int>,
  config: BotConfig,
  events: EventEmitter,
): Bot => {
  const {
    color,
    strategy: {
      type: strategyType,
      proficiency = 1,
      options: strategyOptions,
    } = {},
  } = config;

  const heading = Math.floor(Math.random() * 6);

  const choosePosition = (field: Array<Point>) =>
    Math.floor(Math.random() * field.length);
  let positionNum = choosePosition(field);
  while (startPositions.includes(positionNum)) {
    positionNum = choosePosition(field);
  }
  const position = field[positionNum];
  startPositions.push(positionNum);

  const allOptions: Object = {
    ...strategyOptions,
    events,
  };
  const strategy = strategies[strategyType](allOptions);
  const cooldown = Math.random();
  const defending = false;
  const health = 99;
  const id = uuid();

  return {
    id,
    color,
    defending,
    strategy,
    strategyConfig: { type: strategyType, options: strategyOptions },
    proficiency,
    heading,
    position,
    cooldown,
    health,
    sensorMemory: [],
    moveHistory: [],
  };
};

export default initializeBot;
