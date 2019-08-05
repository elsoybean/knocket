//@flow

import type { Bot, HistoryItem } from '../../types/GameState.types';

const defend = async (bot: Bot): Promise<HistoryItem> => {
  bot.defending = true;
  const elapsed = 2 + Math.random();
  return { botId: bot.id, elapsed, type: 'defend' };
};

export default defend;
