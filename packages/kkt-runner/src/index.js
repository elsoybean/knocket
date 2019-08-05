//@flow

import path from 'path';
import frontend from 'kkt-frontend-tty';
import battle from 'kkt-battle';
import { spawn } from 'child_process';

import type { BotConfig } from '../../kkt-battle/types/GameState.types';

const { MODEL_NAME = 'new_model', MODEL_TRIAL = '0' } = process.env;

const model_file = path.join(
  '../../models/dqn_models',
  MODEL_NAME,
  'trial-' + MODEL_TRIAL + '.model',
);

const play = spawn('python', ['-m', 'kkt_training.play', model_file], {
  stdio: 'pipe',
  env: {
    PYTHONPATH: '../kkt-training',
  },
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
      type: 'streams',
      options: { input: play.stdout, output: play.stdin },
    },
  },
];

const options = {
  gameConfig: { fieldSize: 4, botConfigs },
  frontend,
};

(async () => {
  await battle(options);
})();
