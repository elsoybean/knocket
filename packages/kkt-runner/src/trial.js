//@flow

import _ from 'lodash';
import EventEmitter from 'events';
import { start as startBattle } from 'kkt-battle';

import type {
  BotConfig,
  GameState,
} from '../../kkt-battle/types/GameState.types';

const results = [];

const fieldSize = 4;
const strategies = [
  'lump',
  'erratic',
  'explorer',
  'facer',
  'sentinel',
  'hunter',
  'random',
];
const botConfigs: Array<BotConfig> = [
  { color: 'red', strategy: { type: 'random' } },
  { color: 'blue', strategy: { type: 'explorer' } },
  { color: 'yellow', strategy: { type: 'hunter' } },
];

(async () => {
  for (let i = 0; i < 100 * strategies.length; i++) {
    const events = new EventEmitter();
    botConfigs.forEach((c) => {
      c.strategy.type =
        strategies[Math.floor(Math.random() * strategies.length)];
    });

    events.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit();
    });

    events.on('win', (winner: string, state: GameState) => {
      const { elapsed, steps } = state;
      const winningStrategy = (
        botConfigs.find((c) => c.color == winner) || {
          strategy: { type: '-draw-' },
        }
      ).strategy.type;
      // eslint-disable-next-line no-console
      console.log('Trial', i, 'won by', winningStrategy);
      results.push({ winner: winningStrategy, elapsed, steps });
    });

    events.on('newListener', (event: string) => {
      if (event == 'input') {
        events.emit('error', 'Cannot listen for input on trial runner');
      }
    });

    const options = {
      gameConfig: { fieldSize, botConfigs },
      frontend: { events },
    };

    await startBattle(options);
  }
  _(results)
    .groupBy('winner')
    .each((wins, bot) => {
      // eslint-disable-next-line no-console
      console.log(bot, ((100 * wins.length) / results.length).toFixed(2));
    });
  // eslint-disable-next-line no-console
  console.log(
    'Elapsed',
    'Min:',
    _.minBy(results, 'elapsed').elapsed,
    'Avg: ',
    _.meanBy(results, 'elapsed'),
    'Max: ',
    _.maxBy(results, 'elapsed').elapsed,
  );
  // eslint-disable-next-line no-console
  console.log(
    'Steps',
    'Min:',
    _.minBy(results, 'steps').steps,
    'Avg: ',
    _.meanBy(results, 'steps'),
    'Max: ',
    _.maxBy(results, 'steps').steps,
  );
})();
