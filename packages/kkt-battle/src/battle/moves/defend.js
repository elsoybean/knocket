//@flow

import type { Bot, HistoryItem } from '../../../types/GameState.types';

const defend = (bot: Bot): HistoryItem => {
  const elapsed = Math.random();
  return { botId: bot.id, elapsed, type: 'defend' };
};

export default defend;
