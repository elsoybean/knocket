//@flow

import EventEmitter from 'events';
import { initializeField } from './field';
import { initializeBot, readSensors, reset } from './bot';
import { random as randomStrategy } from './strategies';
import * as moves from './moves';

import type { Bot, GameState, BattleOptions } from '../types/GameState.types';
import type { Move } from '../types/Move.types';

const battle = async ({
  gameConfig: { fieldSize = 5, botConfigs = [] },
  frontend: { render, events = new EventEmitter() },
}: BattleOptions): Promise<void> => {
  try {
    const field = initializeField(fieldSize);
    const startPositions = [];
    const bots = botConfigs.map((config) =>
      initializeBot(field, startPositions, config, events),
    );

    const state: GameState = {
      elapsed: 0,
      steps: 0,
      field,
      bots,
      history: [],
    };

    const applyMove = async (
      bot: Bot,
      move: ?Move,
      state: GameState,
    ): Promise<void> => {
      const { type = 'wait', options } = move || {};
      const moveType =
        type && Object.keys(moves).includes(type) ? type : 'wait';
      const moveFunction = moves[moveType];
      // $FlowFixMe - The options will be the right type, but flow can't tell that
      const historyItem = await moveFunction(bot, state, options);
      bot.cooldown = historyItem.elapsed;
      bot.moveHistory.unshift(historyItem);
      state.history.unshift(historyItem);
    };

    let keepRunning = true;

    events.on('quit', () => {
      keepRunning = false;
    });

    events.emit('init');
    if (render) {
      await render(state);
    }

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
        events.emit('win', 'draw', state);
        keepRunning = false;
      } else if (aliveBots.length == 1) {
        const { color: winner } = aliveBots[0];
        await Promise.all(
          bots.map(async (bot) => {
            const sensorData = readSensors(bot, state);
            const { strategy } = bot;
            await strategy(sensorData, true, bot.health > 0);
          }),
        );
        events.emit('win', winner, state);
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
        await applyMove(activeBot, move, state);
        state.steps++;
        if (render) {
          await render(state);
        }
      }
    }

    events.emit('done');
  } catch (err) {
    events.emit('error', err);
  }
};

export default battle;
