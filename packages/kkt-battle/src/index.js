//@flow

// $FlowFixMe - events does in fact export once
import { once } from 'events';
import { clear, sleep, areEqual } from './util';
import { initializeField } from './field';
import * as moves from './moves';
import { HEADING_ARROWS } from './constants';

import type { Point, Bot, GameState } from '../types/GameState.types';
import type { Move } from '../types/Move.types';

const FIELD_SIZE = 5;

const randomStrategy = async (): Promise<?Move> => {
  const n = Math.random();
  if (n < 0.25) {
    return { type: 'rotate', options: { clockwise: true } };
  }
  if (n < 0.5) {
    return { type: 'rotate', options: { clockwise: false } };
  }
  return { type: 'ahead' };
};

const inputStrategy = async (): Promise<?Move> => {
  const [key] = await once(process.stdin, 'data');

  if (key === '\u001b[A') {
    return { type: 'ahead' };
  }
  if (key === '\u001b[C') {
    return { type: 'rotate', options: { clockwise: true } };
  }
  if (key === '\u001b[D') {
    return { type: 'rotate', options: { clockwise: false } };
  }
};

const bots: Array<Bot> = [];

bots.push({
  position: { x: -3, y: 0, z: 3 },
  heading: 3,
  strategy: randomStrategy,
  color: '\x1b[31m',
});

bots.push({
  position: { x: 3, y: 0, z: -3 },
  heading: 0,
  strategy: inputStrategy,
  color: '\x1b[32m',
});

const state: GameState = {
  field: initializeField(FIELD_SIZE),
  bots,
};

const displayPoint = (p: Point, state: GameState): string => {
  const { bots = [] } = state;
  return bots.reduce((current, bot: Bot) => {
    const { position, heading, color } = bot;
    if (areEqual(p, position)) {
      const c = HEADING_ARROWS[heading];
      return color + c + '\x1b[0m';
    } else {
      return current;
    }
  }, '_');
};

const displayField = (state: GameState) => {
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

const applyMove = (bot: Bot, move: ?Move, state: GameState): void => {
  const { type, options } = move || {};
  if (type && Object.keys(moves).includes(type)) {
    const moveFunction = moves[type];
    // $FlowFixMe - The options will be the right type, but flow can't tell that
    moveFunction(bot, state, options);
  }
};

let keepRunning = true;
process.stdin.resume();
// $FlowFixMe - this works
process.stdin.setRawMode(true);
process.stdin.setEncoding('utf8');
process.stdin.on('data', (key: string) => {
  if (key == 'q' || key === '\u0003') {
    keepRunning = false;
  }
});

(async () => {
  try {
    while (keepRunning) {
      clear();
      displayField(state);

      const { bots } = state;
      await bots.reduce(
        (chain, bot) =>
          chain.then(async () => {
            const { strategy } = bot;
            const move = await strategy();
            applyMove(bot, move, state);
          }),
        Promise.resolve(),
      );

      await sleep(100);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  } finally {
    process.exit();
  }
})();
