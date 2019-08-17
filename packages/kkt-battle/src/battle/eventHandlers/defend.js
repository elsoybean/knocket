//@flow

import type {
  Bot,
  GameState,
  HistoryItem,
} from '../../../types/GameState.types';

const defend = (state: GameState, historyItem: HistoryItem, bot: Bot) => {
  bot.defending = true;
};

export default defend;
