//@flow

import type {
  Bot,
  GameState,
  HistoryItem,
} from '../../../types/GameState.types';
import type { RotateOptions } from '../../../types/Move.types';

const rotate = (
  bot: Bot,
  _state_: GameState,
  options?: RotateOptions,
): HistoryItem => {
  const { clockwise = true } = options || {};
  const elapsed = 1.5 + Math.random();
  return { botId: bot.id, elapsed, type: 'rotate', clockwise };
};

export default rotate;
