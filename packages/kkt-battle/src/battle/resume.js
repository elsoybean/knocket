//@flow

import { createStrategy } from '../bot';
import executeMove from './executeMove';
import applyToState from './applyToState';
import battleCycle from './battleCycle';

import type { GameState, Frontend } from '../../types/GameState.types';
import type { Move } from '../../types/Move.types';

const resume = async (
  state: GameState,
  move: Move,
  { render, events }: Frontend,
): Promise<void> => {
  try {
    state.bots.forEach((b) => {
      const { strategyConfig: { type, options } = {} } = b;
      b.strategy = createStrategy(type, options, events);
    });

    if (move) {
      const { bots } = state;
      const activeBot = bots
        .filter((bot) => bot.health > 0)
        .sort((a, b) => a.cooldown - b.cooldown)[0];
      const historyItem = executeMove(activeBot, move, state);
      applyToState(state, historyItem);
    }
    events.emit('resume', state);
    await battleCycle(state, render, events);
  } catch (err) {
    events.emit('error', err);
  }
};

export default resume;
