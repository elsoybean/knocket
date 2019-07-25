//@flow
const { once } = require('events');

type Move = 'ahead' | 'rotate-ccw' | 'rotate-cw';

type Point = {
  x: number,
  y: number,
  z: number,
};

type Heading = Point & { c: string };

type Bot = {
  position: Point,
  heading: number,
  strategy: () => Promise<?Move>,
  color: string,
};

type GameState = {
  bots: Array<Bot>,
  field: Array<Point>,
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const clear = () => process.stdout.write('\u001b[2J\u001b[0;0H');

const addPoints = (a: Point, b: Point): Point => ({
  x: a.x + b.x,
  y: a.y + b.y,
  z: a.z + b.z,
});

const areEqual = (a: Point, b: Point): boolean =>
  a.x == b.x && a.y == b.y && a.z == b.z;

const headings: Array<Heading> = [
  { x: -1, y: 0, z: 1, c: '↖' },
  { x: -1, y: 1, z: 0, c: '↗' },
  { x: 0, y: 1, z: -1, c: '→' },
  { x: 1, y: 0, z: -1, c: '↘' },
  { x: 1, y: -1, z: 0, c: '↙' },
  { x: 0, y: -1, z: 1, c: '←' },
];

const randomStrategy = async (): Promise<?Move> => {
  const n = Math.random();
  if (n < 0.25) {
    return 'rotate-cw';
  }
  if (n < 0.5) {
    return 'rotate-ccw';
  }
  return 'ahead';
};

const inputStrategy = async (): Promise<?Move> => {
  const [key] = await once(process.stdin, 'data');

  if (key === '\u001b[A') {
    return 'ahead';
  }
  if (key === '\u001b[C') {
    return 'rotate-cw';
  }
  if (key === '\u001b[D') {
    return 'rotate-ccw';
  }
};

const field: Array<Point> = [];
for (let x = -3; x <= 3; x++) {
  for (let y = Math.max(-3, -3 - x); y <= 3; y++) {
    const z = 0 - x - y;
    if (z >= -3 && z <= 3) {
      field.push({ x, y, z });
    }
  }
}

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
  field,
  bots,
};

const displayPoint = (p: Point, state: GameState): string => {
  const { bots = [] } = state;
  return bots.reduce((current, bot) => {
    const { position, heading, color } = bot;
    if (areEqual(p, position)) {
      const { c } = headings[heading];
      return color + c + '\x1b[0m';
    } else {
      return current;
    }
  }, '_');
};

const displayField = (state: GameState) => {
  const { field } = state;
  for (let x = -3; x <= 3; x++) {
    const row = field.filter((p) => p.x === x) || [];
    const spaces = 6 + row[0].y - row[0].z;
    process.stdout.write(
      ' '.repeat(spaces) +
        row.map((p) => displayPoint(p, state)).join(' ') +
        '\n',
    );
  }
};

const applyMove = (bot: Bot, move: ?Move, _state_: GameState): void => {
  switch (move) {
    case 'ahead': {
      const newPosition = addPoints(bot.position, headings[bot.heading]);
      if (
        field.find((p) => areEqual(p, newPosition)) &&
        !bots.find((otherBot) => areEqual(otherBot.position, newPosition))
      ) {
        bot.position = newPosition;
      }
      break;
    }
    case 'rotate-cw': {
      bot.heading = (bot.heading + 1) % 6;
      break;
    }
    case 'rotate-ccw': {
      bot.heading = (bot.heading + 5) % 6;
      break;
    }
  }
};

let keepRunning = true;
process.stdin.resume();
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
    console.error(err);
  } finally {
    process.exit();
  }
})();
