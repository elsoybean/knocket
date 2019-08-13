//@flow

import EventEmitter from 'events';
import _ from 'lodash';

import type {
  Point,
  GameState,
  Bot,
  Frontend,
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

const ttyFrontend = () => {
  let modelMessage = '';
  let quitting = false;

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

    if (!quitting) {
      await sleep(150);
    }
  };

  const events = new EventEmitter();

  events.on('init', () => {
    process.stdin.resume();
    // $FlowFixMe - this works
    process.stdin.setRawMode(true);
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (key: string) => {
      if (key == 'q' || key === '\u0003') {
        events.emit('quit');
        events.emit('input', 'quit');
      } else if (key === '\u001b[A') {
        events.emit('input', 'ahead');
      } else if (key === '\u001b[B') {
        events.emit('input', 'reverse');
      } else if (key === ' ') {
        events.emit('input', 'attack');
      } else if (key === '\u001b[C') {
        events.emit('input', 'rotate', true);
      } else if (key === '\u001b[D') {
        events.emit('input', 'rotate', false);
      } else if (key === 'x') {
        events.emit('input', 'defend');
      }
    });
  });

  events.on('win', (winner: Bot, state: GameState) => {
    const { elapsed } = state;
    // eslint-disable-next-line no-console
    console.log(winner.color, 'has won! It took', elapsed);
  });

  events.on('draw', () => {
    // eslint-disable-next-line no-console
    console.log('The game ended in a draw :/');
  });

  events.on('done', process.exit);

  events.on('quit', () => {
    quitting = true;
  });

  events.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit();
  });

  events.on('model-data', (message) => {
    modelMessage = message;
  });

  return { events, render };
};

export default ttyFrontend;
