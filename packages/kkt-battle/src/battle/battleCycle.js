//@flow

import { readSensors, reset, createStrategy } from '../bot';
import { random as randomStrategy } from '../strategies';

import type { GameState } from '../../types/GameState.types';
import type { Move } from '../../types/Move.types';

const battleCycle = async (
  state: GameState,
  { collectMove, publishMove, broadcastResult },
): Promise<Move> => {
  const { bots = [], elapsed } = state;

  if (bots.length == 0) {
    throw new Error('No bots in battle state');
  }

  const aliveBots = bots.filter((bot) => bot.health > 0);
  if (elapsed > 2000) {
    await broadcastResult({ result: 'draw', state });
  } else if (aliveBots.length == 1) {
    await broadcastResult({ result: 'win', bot: aliveBots[0], state });
  } else {
    const activeBot = aliveBots.sort((a, b) => a.cooldown - b.cooldown)[0];
    const { cooldown: elapsed, proficiency, strategyConfig } = activeBot;
    state.elapsed += elapsed;
    aliveBots.forEach((bot) => {
      bot.cooldown -= elapsed;
    });
    reset(activeBot);

    const sensorData = readSensors(activeBot, state);

    const strategy =
      Math.random() < proficiency
        ? createStrategy(strategyConfig)
        : randomStrategy;
    const move = await strategy(sensorData);
    const { type, options: { handle } = {} } = move;
    if (type === 'collect') {
      await collectMove(handle, sensorData);
    } else {
      await publishMove(activeBot, move);
    }
  }
};

export default battleCycle;
