//@flow

import EventEmitter from 'events';
import { v4 as uuid } from 'uuid';
import _ from 'lodash';
import { initializeField } from '../field';
import { initializeBot } from '../bot';
import battleCycle from './battleCycle';

import type { BattleOptions } from '../../types/GameState.types';

const start = async ({
  gameConfig: { fieldSize = 5, botConfigs = [] },
  frontend: { render, events = new EventEmitter() },
}: BattleOptions): Promise<void> => {
  try {
    const field = initializeField(fieldSize);
    const startPositions = [];
    const bots = botConfigs.map((config) =>
      initializeBot(field, startPositions, config, events),
    );
    const id = uuid();

    const state = {
      id,
      elapsed: 0,
      steps: 0,
      field,
      bots,
      history: [],
    };

    state.history.push({
      type: 'initialState',
      state: _.omit(state, 'history'),
    });

    events.emit('init', state);
    await battleCycle(state, render, events);
  } catch (err) {
    events.emit('error', err);
  }
};

export default start;
