//@flow

import frontend from 'kkt-frontend-tty';
import battle from 'kkt-battle';
import { spawn } from 'child_process';

import type { BotConfig } from '../../kkt-battle/types/GameState.types';

const train = spawn('python', ['../train/train.py'], {
  stdio: 'pipe',
});

train.stdout.setEncoding('utf8');
train.stderr.setEncoding('utf8');

train.stderr.on('data', (message) => {
  console.error('trainer err: ', message);
});

train.on('close', (code) => {
  console.error('trainer exited with', code);
  process.exit();
});

const botConfigs: Array<BotConfig> = [
  { color: 'blue', strategy: { type: 'input' } },
  {
    color: 'yellow',
    strategy: {
      type: 'streams',
      options: { input: train.stdout, output: train.stdin },
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
