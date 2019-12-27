//@flow

import EventEmitter from 'events';
import _ from 'lodash';
import { start as startBattle, battleCycle, executeMove } from 'kkt-battle';
import { applyToState } from 'kkt-battle-events';

import type {
  Point,
  GameState,
  Bot,
} from '../../kkt-battle/types/GameState.types';

const HEADING_ARROWS: Array<string> = ['↖', '↗', '→', '↘', '↙', '←'];
const MOVE_ICONS: { [string]: string } = {
  ahead: '↑',
  reverse: '↓',
  attack: '!',
  rotatecw: '→',
  rotateccw: '←',
  defend: 'X',
  wait: '·',
};

const COLORS = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const displayPoint = (p: Point, state: GameState): string => {
  const { bots = [] } = state;
  return bots.reduce((current, bot: Bot) => {
    const { position, heading, color } = bot;
    if (_.isEqual(p, position)) {
      const c = HEADING_ARROWS[heading];
      return (
        (bot.health <= 0 ? '\u001b[47m' : '') + COLORS[color] + c + '\x1b[0m'
      );
    } else {
      return current;
    }
  }, '·');
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

let modelMessage = '';
let keepRunning = true;

const render = async (state: GameState): Promise<void> => {
  process.stdout.write('\u001b[2J\u001b[0;0H');
  const { field, history, bots } = state;
  const fieldSize = (3 + Math.sqrt(9 + 12 * (field.length - 1))) / 6;
  for (let x = -1 * (fieldSize - 1); x < fieldSize; x++) {
    const row = field.filter((p) => p.x === x) || [];
    const spaces = (fieldSize - 1) * 2 + row[0].y - row[0].z;
    process.stdout.write(
      ' '.repeat(spaces) +
        row.map((p) => displayPoint(p, state)).join(' ') +
        '\n',
    );
  }
  process.stdout.write('\n\n');
  bots.forEach((b) => {
    process.stdout.write(COLORS[b.color]);
    process.stdout.write(b.health + '  ');
    history
      .filter((h) => h.botId == b.id)
      .slice(0, 100)
      .forEach((h) => {
        let { type } = h;
        if (type == 'rotate') {
          type += h.clockwise ? 'cw' : 'ccw';
        }
        process.stdout.write(MOVE_ICONS[type]);
      });
    process.stdout.write('\x1b[0m\n');
  });

  process.stdout.write(modelMessage + '\n');

  if (keepRunning) {
    await sleep(150);
  }
};

const events = new EventEmitter();

process.stdin.resume();
// $FlowFixMe - this works
process.stdin.setRawMode(true);
process.stdin.setEncoding('utf8');
process.stdin.on('data', (key: string) => {
  if (key == 'q' || key === '\u0003') {
    events.emit('quit');
    events.emit('input', { type: 'quit' });
  } else if (key === '\u001b[A') {
    events.emit('input', { type: 'ahead' });
  } else if (key === '\u001b[B') {
    events.emit('input', { type: 'reverse' });
  } else if (key === ' ') {
    events.emit('input', { type: 'attack' });
  } else if (key === '\u001b[C') {
    events.emit('input', { type: 'rotate', options: { clockwise: true } });
  } else if (key === '\u001b[D') {
    events.emit('input', { type: 'rotate', options: { clockwise: false } });
  } else if (key === 'x') {
    events.emit('input', { type: 'defend' });
  }
});

events.on('quit', () => {
  keepRunning = false;
});

events.on('model-data', (message) => {
  modelMessage = message;
});

const botConfigs: Array<BotConfig> = [
  { color: 'green', strategy: { type: 'offline', options: { handle: 'tty' } } },
  { color: 'red', strategy: { type: 'hunter' } },
  { color: 'blue', strategy: { type: 'lump' } },
];

const options = {
  gameConfig: { fieldSize: 4, botConfigs },
};

(async () => {
  const state = await startBattle(options);
  while (keepRunning) {
    render(state);
    const cyclePromise = new Promise((resolve) => {
      const publishMove = (activeBot, move) => {
        if (keepRunning) {
          const historyItem = executeMove(activeBot, move, state);
          applyToState(state, historyItem);
        }
        resolve();
      };

      const collectMove = (activeHandle, _sensorData_) => {
        events.once('input', (move) => {
          const { bots } = state;
          const bot = bots.find(
            ({ strategyConfig: { options: { handle } = {} } = {} }) =>
              activeHandle === handle,
          );
          publishMove(bot, move);
        });
      };

      const broadcastResult = ({ result, state, bot: winner }) => {
        if (result === 'win') {
          const { elapsed } = state;
          console.log(winner.color, 'has won! It took', elapsed);
        } else {
          console.log('The game ended in a draw :/');
        }
        keepRunning = false;
        resolve();
      };

      battleCycle(state, {
        collectMove,
        publishMove,
        broadcastResult,
      });
    });
    await cyclePromise;
  }
  process.stdin.pause();
  render(state);
})();
