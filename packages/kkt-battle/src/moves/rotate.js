//@flow

import type { Bot, GameState } from '../../types/GameState.types';
import type { RotateOptions } from '../../types/Move.types';

const rotate = (bot: Bot, _state_: GameState, options?: RotateOptions) => {
  const { clockwise = true } = options || {};
  bot.heading = (bot.heading + (clockwise ? 1 : 5)) % 6;
};

export default rotate;
