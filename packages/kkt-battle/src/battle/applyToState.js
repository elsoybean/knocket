//@flow

import * as eventHandlers from './eventHandlers';

const applyToState = (state: GameState, historyItem: HistoryItem) => {
  const { bots } = state;
  const { botId, type } = historyItem;
  const bot = bots.find((b) => b.id == botId);

  if (!bot) {
    throw new Error(`Cannot find bot ${botId} in game state`);
  }

  if (!Object.keys(eventHandlers).includes(type)) {
    throw new Error(`Cannot find event handler for ${type}`);
  }

  eventHandlers[type](state, historyItem, bot);

  bot.cooldown = historyItem.elapsed;
  bot.moveHistory.unshift(historyItem);
  state.history.unshift(historyItem);
  state.steps++;
};

export default applyToState;
