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
  state: runningState,
  move,
}: BattleOptions): Promise<void> => {
  try {
    let state: GameState;
    if (!runningState) {
      const field = initializeField(fieldSize);
      const startPositions = [];
      const bots = botConfigs.map((config) =>
        initializeBot(field, startPositions, config, events),
      );

      state = {
        elapsed: 0,
        steps: 0,
        field,
        bots,
        history: [],
      };
    } else {
      state = runningState;
      if (move) {
        const { bots } = state;
        const activeBot = bots
          .filter((bot) => bot.health > 0)
          .sort((a, b) => a.cooldown - b.cooldown)[0];
        await applyMove(activeBot, move, state);
      }
    }

    const makeCheckpoint = (state: GameState) => {
      const moveHistory = state.history.filter((h) => h.type != 'checkpoint');
      const checkpoint = {
        botId: 'n/a',
        elapsed: 0,
        type: 'checkpoint',
        state: {
          ...state,
          history: moveHistory,
        },
      };
      state.history.unshift(checkpoint);
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
      state.steps++;
    };

    makeCheckpoint(state);

    let keepRunning = true,
      pausing = false;

    events.on('quit', () => {
      keepRunning = false;
    });

    events.emit('init');
    if (render) {
      await render(state);
    }

    events.on('pause', (state: GameState) => {
      makeCheckpoint(state);
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
        if (move) {
          await applyMove(activeBot, move, state);
        }
        if (render) {
          await render(state);
        }
      }
    }

    if (!pausing) {
      events.emit('done');
    }
  } catch (err) {
    events.emit('error', err);
  }
};

export default battle;
