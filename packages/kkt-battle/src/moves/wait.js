//@flow

import type { Bot, GameState, HistoryItem } from '../../types/GameState.types';

const wait = async (bot: Bot, _state_: GameState): Promise<HistoryItem> => ({
  botId: bot.id,
  type: 'wait',
  elapsed: Math.random(),
});

export default wait;
