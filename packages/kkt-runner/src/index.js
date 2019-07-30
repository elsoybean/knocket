//@flow

import frontend from 'kkt-frontend-tty';
import battle from 'kkt-battle';
import { spawn } from 'child_process';

import type { BotConfig } from '../../kkt-battle/types/GameState.types';

const play = spawn('python', ['../train/play.py'], {
  stdio: 'pipe',
});

play.stdout.setEncoding('utf8');
play.stderr.setEncoding('utf8');

play.stderr.on('data', (message) => {
  console.error('model err: ', message);
});

play.on('close', (code) => {
  console.error('model exited with', code);
  process.exit();
});

const botConfigs: Array<BotConfig> = [
  { color: 'blue', strategy: { type: 'basic' } },
  {
    color: 'yellow',
    strategy: {
      type: 'input',
      //options: { input: play.stdout, output: play.stdin },
    },
  },
];

const options = {
  gameConfig: { fieldSize: 5, botConfigs },
  frontend,
};

(async () => {
  await battle(options);
})();
