//@flow
import * as moves from './moves';

import type { Bot, GameState, HistoryItem } from '../../types/GameState.types';
import type { Move } from '../../types/Move.types';

const executeMove = (bot: Bot, move: ?Move, state: GameState): HistoryItem => {
  const { type = 'wait', options } = move || {};
  const moveType = type && Object.keys(moves).includes(type) ? type : 'wait';
  const moveFunction = moves[moveType];
  // $FlowFixMe - The options will be the right type, but flow can't tell that
  return moveFunction(bot, state, options);
};

export default executeMove;
