// @flow

import loadBattle from '../common/loadBattle';

exports.handler = async (event) => {
  const { Records = [] } = event;

  for (const {
    battleId,
    moveId,
    bot: { id: movingId } = {},
    move,
  } of Records) {
    const state = await loadBattle(battleId);
    const { bots, elapsed } = state;
    const aliveBots = bots.filter((bot) => bot.health > 0);
    const { id: activeId } =
      aliveBots.sort((a, b) => a.cooldown - b.cooldown)[0] || {};
    if (
      elapsed > 2000 ||
      aliveBots.length < 2 ||
      !activeId ||
      movingId !== activeId
    ) {
      console.log('Ignoring move', {
        elapsed,
        numAlive: aliveBots.length,
        activeId,
        movingId,
      });
    } else {
      console.log('Applying move', { movingId, move });
    }
  }
};
