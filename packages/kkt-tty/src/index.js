//@flow

import EventEmitter from 'events';
import battle, { areEqual } from 'kkt-battle';

import type {
  Point,
  GameState,
  Bot,
} from '../../kkt-battle/types/GameState.types';

const HEADING_ARROWS: Array<string> = ['↖', '↗', '→', '↘', '↙', '←'];

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
    if (areEqual(p, position)) {
      const c = HEADING_ARROWS[heading];
      return COLORS[color] + c + '\x1b[0m';
    } else {
      return current;
    }
  }, '_');
};

const render = (state: GameState) => {
  process.stdout.write('\u001b[2J\u001b[0;0H');
  const { field } = state;
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
};

const events = new EventEmitter();

process.stdin.resume();
// $FlowFixMe - this works
process.stdin.setRawMode(true);
process.stdin.setEncoding('utf8');
process.stdin.on('data', (key: string) => {
  if (key == 'q' || key === '\u0003') {
    events.emit('input', 'quit');
  } else if (key === '\u001b[A') {
    events.emit('input', 'ahead');
  } else if (key === '\u001b[C') {
    events.emit('input', 'rotate', true);
  } else if (key === '\u001b[D') {
    events.emit('input', 'rotate', false);
  }
});

(async () => {
  try {
    await battle(render, events);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  } finally {
    process.exit();
  }
})();
