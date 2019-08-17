//@flow

import type { Bot, HistoryItem } from '../../../types/GameState.types';

const ahead = (bot: Bot): HistoryItem => {
  const elapsed = 1.5 + Math.random();
  return { botId: bot.id, elapsed, type: 'ahead' };
};

export default ahead;
