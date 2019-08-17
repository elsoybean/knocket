//@flow

import type {
  Bot,
  GameState,
  HistoryItem,
} from '../../../types/GameState.types';

const wait = (bot: Bot, _state_: GameState): HistoryItem => ({
  botId: bot.id,
  type: 'wait',
  elapsed: Math.random(),
});

export default wait;
