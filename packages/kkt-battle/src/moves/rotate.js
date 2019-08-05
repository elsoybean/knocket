//@flow

import type { Bot, GameState, HistoryItem } from '../../types/GameState.types';
import type { RotateOptions } from '../../types/Move.types';

const rotate = async (
  bot: Bot,
  _state_: GameState,
  options?: RotateOptions,
): Promise<HistoryItem> => {
  const { clockwise = true } = options || {};
  bot.heading = (bot.heading + (clockwise ? 1 : 5)) % 6;
  const elapsed = 2 + Math.random();
  return { botId: bot.id, elapsed, type: 'rotate', clockwise };
};

export default rotate;
