//@flow

import _ from 'lodash';
import EventEmitter from 'events';
import battle from 'kkt-battle';

import type {
  BotConfig,
  GameState,
} from '../../kkt-battle/types/GameState.types';

const results = [];

const fieldSize = 4;
const botConfigs: Array<BotConfig> = [
  { color: 'red', strategy: { type: 'random' } },
  { color: 'blue', strategy: { type: 'basic' } },
];

(async () => {
  for (let i = 0; i < 100; i++) {
    const events = new EventEmitter();

    events.on('error', (err) => {
      console.error(err);
      process.exit();
    });

    events.on('win', (winner: string, state: GameState) => {
      const { elapsed } = state;
      results.push({ winner, elapsed });
    });

    events.on('newListener', (event: string) => {
      if (event == 'input') {
        events.emit('error', 'Cannot listen for input on trial frontend');
      }
    });

    const options = {
      gameConfig: { fieldSize, botConfigs },
      frontend: { events },
    };

    await battle(options);
  }
  _(results)
    .groupBy('winner')
    .each((wins, bot) => {
      console.log(bot, ((100 * wins.length) / results.length).toFixed(2));
    });
  console.log(
    'Min:',
    _.minBy(results, 'elapsed').elapsed,
    'Avg: ',
    _.meanBy(results, 'elapsed'),
    'Max: ',
    _.maxBy(results, 'elapsed').elapsed,
  );
})();
