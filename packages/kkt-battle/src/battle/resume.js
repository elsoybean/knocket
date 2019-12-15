//@flow

import { createStrategy } from '../bot';
import executeMove from './executeMove';
import { applyToState } from 'kkt-battle-events';

import type { GameState } from '../../types/GameState.types';
import type { Move } from '../../types/Move.types';

const resume = async (state: GameState, move: Move): Promise<void> => {
  state.bots.forEach((b) => {
    const { strategyConfig: { type, options } = {} } = b;
    b.strategy = createStrategy(type, options);
  });

  if (move) {
    const { bots } = state;
    const activeBot = bots
      .filter((bot) => bot.health > 0)
      .sort((a, b) => a.cooldown - b.cooldown)[0];
    const historyItem = executeMove(activeBot, move, state);
    applyToState(state, historyItem);
  }
  return state;
};

export default resume;
