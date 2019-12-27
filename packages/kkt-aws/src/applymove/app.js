// @flow

import loadBattle from '../common/loadBattle';

exports.handler = async (event) => {
  const { Records = [] } = event;

  for (const {
    body,
    body: { battleId, bot: { id: movingId } = {}, move } = {},
  } of Records) {
    console.log('Got move to apply', battleId, body, typeof body);
    if (!battleId) {
      console.error('No battle ID; discarding message', battleId);
      return;
    }

    const { state } = (await loadBattle(battleId)) || {};
    if (!state) {
      console.error('Could not load battle; discarding message');
      return;
    }

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
      return;
    }

    console.log('Applying move', { movingId, move });
  }
};
