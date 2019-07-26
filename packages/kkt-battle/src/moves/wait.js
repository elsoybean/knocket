//@flow

import type { Bot, GameState } from '../../types/GameState.types';

const wait = async (_bot_: Bot, _state_: GameState): Promise<number> =>
  Math.random();

export default wait;
