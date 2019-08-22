//@flow

import type {
  Bot,
  GameState,
  HistoryItem,
} from '../../../kkt-battle/types/GameState.types';

const attack = (state: GameState, historyItem: HistoryItem, bot: Bot) => {
  const { target: targetId, damage } = historyItem;
  if (targetId) {
    const { bots } = state;
    const target = bots.find((b) => b.id == targetId);
    if (!target) {
      throw new Error(`Could not find target of attack ${targetId}`);
    }
    target.health = Math.max(0, target.health - damage);
  }
  bot.attacking = true;
};

export default attack;
