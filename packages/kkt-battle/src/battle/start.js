//@flow

import { v4 as uuid } from 'uuid';
import _ from 'lodash';
import { initializeField } from '../field';
import { initializeBot } from '../bot';

import type { BattleOptions } from '../../types/GameState.types';

const start = async ({
  gameConfig: { fieldSize = 5, botConfigs = [] },
}: BattleOptions): Promise<GameState> => {
  const field = initializeField(fieldSize);
  const startPositions = [];
  const bots = botConfigs.map((config) =>
    initializeBot(field, startPositions, config),
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

  return state;
};

export default start;
