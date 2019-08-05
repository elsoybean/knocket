//@flow

import EventEmitter from 'events';

import battle from 'kkt-battle';

import type { BotConfig } from '../../kkt-battle/types/GameState.types';

process.stdin.setEncoding('utf8');

const botConfigs: Array<BotConfig> = [
  { color: 'red', strategy: { type: 'basic' } },
  {
    color: 'yellow',
    strategy: {
      type: 'streams',
      options: { input: process.stdin, output: process.stdout },
    },
  },
];

const events = new EventEmitter();

events.on('error', (err) => {
  console.error(err);
  process.exit();
});

const options = {
  gameConfig: { fieldSize: 4, botConfigs },
  frontend: { events, render: undefined },
};

(async () => {
  await battle(options);
})();
