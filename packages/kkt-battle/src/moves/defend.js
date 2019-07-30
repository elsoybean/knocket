//@flow

import type { Bot, HistoryItem } from '../../types/GameState.types';

const defend = async (bot: Bot): Promise<HistoryItem> => {
  bot.defending = true;
  const elapsed = 3.5 + Math.random();
  return { botId: bot.id, elapsed, type: 'defend' };
};

export default defend;
