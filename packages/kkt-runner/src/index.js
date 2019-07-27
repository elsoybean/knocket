//@flow

import frontend from 'kkt-frontend-tty';
import battle from 'kkt-battle';

import type { BotConfig } from '../../kkt-battle/types/GameState.types';

const botConfigs: Array<BotConfig> = [
  { color: 'red', strategy: { type: 'random' } },
  { color: 'blue', strategy: { type: 'input' } },
];

const options = {
  gameConfig: { fieldSize: 4, botConfigs },
  frontend,
};

(async () => {
  await battle(options);
})();
