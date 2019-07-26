//@flow

import type { Bot, GameState } from '../../types/GameState.types';
import type { AttackOptions } from '../../types/Move.types';

const attack = async (
  _bot_: Bot,
  _state_: GameState,
  _options_?: AttackOptions,
): Promise<number> => Math.random();

export default attack;
