//@flow

import type { Bot, GameState } from '../../types/GameState.types';
import type { RotateOptions } from '../../types/Move.types';

const rotate = async (
  bot: Bot,
  _state_: GameState,
  options?: RotateOptions,
): Promise<number> => {
  const { clockwise = true } = options || {};
  bot.heading = (bot.heading + (clockwise ? 1 : 5)) % 6;
  return 0.5 + Math.random();
};

export default rotate;
