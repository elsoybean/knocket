//@flow

import EventEmitter from 'events';
import { start as startBattle } from 'kkt-battle';
import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

import type { BotConfig } from '../../kkt-battle/types/GameState.types';

let keepRunning = true;

const fieldSize = 4;
const strategies = [
  'lump',
  'erratic',
  'explorer',
  'facer',
  'sentinel',
  'hunter',
  'random',
];
const botConfigs: Array<BotConfig> = [
  { color: 'red', strategy: { type: 'random' } },
  { color: 'blue', strategy: { type: 'explorer' } },
  { color: 'yellow', strategy: { type: 'hunter' } },
];

const oneBattle = async () => {
  const botHistory = { red: [], blue: [], yellow: [] };
  let winnerHistory;
  const events = new EventEmitter();
  botConfigs.forEach((c) => {
    c.strategy.type = strategies[Math.floor(Math.random() * strategies.length)];
  });

  events.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit();
  });

  events.on('newListener', (event: string) => {
    if (event == 'input') {
      events.emit('error', 'Cannot listen for input on trial runner');
    }
  });

  events.on('moveChosen', (activeBot, sensorData, move) => {
    const { color } = activeBot;
    botHistory[color].push({ sensorData, move });
  });

  events.on('win', (winner: Bot) => {
    const { color } = winner;
    winnerHistory = botHistory[color];
  });

  const options = {
    gameConfig: { fieldSize, botConfigs },
    frontend: { events },
  };

  await startBattle(options);
  return winnerHistory;
};

const shutdown = () => {
  if (keepRunning) {
    // eslint-disable-next-line no-console
    console.log(
      'Got shutdown notification, will stop after all running battles are complete. Press Ctrl-C again to force close.',
    );
    keepRunning = false;
  } else {
    // eslint-disable-next-line no-console
    console.log('Forcing shutdown');
    process.exit();
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

let _client;

const connect = async () => {
  if (!_client || !_client.isConnected()) {
    _client = await MongoClient.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      poolSize: 10,
    });
  }
  return _client.db();
};

let n = 0;

const worker = async () => {
  while (keepRunning) {
    const winnerData = await oneBattle();
    if (winnerData) {
      n++;
      const db = await connect();
      await db
        .collection('training')
        .insertMany(winnerData, { ordered: false });
      process.stdout.write(n % 10 == 0 ? '0' : '.');
      if (n > 1000) {
        keepRunning = false;
      }
    }
  }
};

(async () => {
  config();

  const workers = [];
  for (let i = 0; i < 3; i++) {
    workers.push(worker());
  }
  await Promise.all(workers);

  if (_client) {
    await _client.close();
  }
})();
