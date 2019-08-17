//@flow

import { readSensors, reset } from '../bot';
import { random as randomStrategy } from '../strategies';
import executeMove from './executeMove';
import applyToState from './applyToState';

import type { GameState, RenderFunction } from '../../types/GameState.types';

const battleCycle = async (
  state: GameState,
  render: RenderFunction,
  events: EventEmitter,
) => {
  let keepRunning = true,
    pausing = false;

  events.on('quit', () => {
    keepRunning = false;
  });

  if (render) {
    await render(state);
  }

  events.on('pause', () => {
    pausing = true;
    keepRunning = false;
  });

  while (keepRunning) {
    const { bots, elapsed } = state;
    const aliveBots = bots.filter((bot) => bot.health > 0);
    if (elapsed > 2000) {
      await Promise.all(
        bots.map(async (bot) => {
          const sensorData = readSensors(bot, state);
          const { strategy } = bot;
          await strategy(sensorData, true, false);
        }),
      );
      events.emit('draw', state);
      keepRunning = false;
    } else if (aliveBots.length == 1) {
      await Promise.all(
        bots.map(async (bot) => {
          const sensorData = readSensors(bot, state);
          const { strategy } = bot;
          await strategy(sensorData, true, bot.health > 0);
        }),
      );
      events.emit('win', aliveBots[0], state);
      keepRunning = false;
    } else {
      const activeBot = aliveBots.sort((a, b) => a.cooldown - b.cooldown)[0];
      const { cooldown: elapsed, proficiency } = activeBot;
      state.elapsed += elapsed;
      aliveBots.forEach((bot) => {
        bot.cooldown -= elapsed;
      });
      reset(activeBot);

      const sensorData = readSensors(activeBot, state);
      events.emit('sensor', sensorData);
      let strategy;
      if (Math.random() < proficiency) {
        ({ strategy } = activeBot);
      } else {
        strategy = randomStrategy;
      }
      const move = await strategy(sensorData);
      if (move) {
        events.emit('moveChosen', activeBot, sensorData, move);
        const historyItem = executeMove(activeBot, move, state);
        applyToState(state, historyItem);
      }
      if (render) {
        await render(state);
      }
    }
  }

  if (!pausing) {
    events.emit('done');
  }
};

export default battleCycle;
