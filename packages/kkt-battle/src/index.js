//@flow

import EventEmitter from 'events';
import { v4 as uuid } from 'uuid';
import _ from 'lodash';
import { initializeField } from './field';
import { initializeBot, readSensors, reset } from './bot';
import { random as randomStrategy } from './strategies';
import createStrategy from './bot/createStrategy';
import * as moves from './moves';

import type {
  Bot,
  GameState,
  BattleOptions,
  Frontend,
} from '../types/GameState.types';
import type { Move } from '../types/Move.types';

const applyMove = async (
  bot: Bot,
  move: ?Move,
  state: GameState,
): Promise<void> => {
  const { type = 'wait', options } = move || {};
  const moveType = type && Object.keys(moves).includes(type) ? type : 'wait';
  const moveFunction = moves[moveType];
  // $FlowFixMe - The options will be the right type, but flow can't tell that
  const historyItem = await moveFunction(bot, state, options);
  bot.cooldown = historyItem.elapsed;
  bot.moveHistory.unshift(historyItem);
  state.history.unshift(historyItem);
  state.steps++;
};

const execute = async (state, render, events) => {
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
};

const resume = async (
  state: GameState,
  move: Move,
  { render, events }: Frontend,
): Promise<void> => {
  try {
    state.bots.forEach((b) => {
      const { strategyConfig: { type, options } = {} } = b;
      b.strategy = createStrategy(type, options, events);
    });

    if (move) {
      const { bots } = state;
      const activeBot = bots
        .filter((bot) => bot.health > 0)
        .sort((a, b) => a.cooldown - b.cooldown)[0];
      await applyMove(activeBot, move, state);
    }
    events.emit('resume', state);
    await execute(state, render, events);
  } catch (err) {
    events.emit('error', err);
  }
};

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
    const id = uuid();

    const state = {
      id,
      elapsed: 0,
      steps: 0,
      field,
      bots,
      history: [],
    };

    state.history.push({
      type: 'initialState',
      state: _.omit(state, 'history'),
    });

    events.emit('init', state);
    await execute(state, render, events);
  } catch (err) {
    events.emit('error', err);
  }
};

export default battle;
export { resume };
