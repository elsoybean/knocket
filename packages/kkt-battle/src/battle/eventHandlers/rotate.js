//@flow

import type {
  Bot,
  GameState,
  HistoryItem,
} from '../../../types/GameState.types';

const rotate = (state: GameState, historyItem: HistoryItem, bot: Bot) => {
  const { clockwise = true } = historyItem;
  bot.heading = (bot.heading + (clockwise ? 1 : 5)) % 6;
};

export default rotate;
