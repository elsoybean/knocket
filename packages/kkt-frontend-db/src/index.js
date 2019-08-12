//@flow

import EventEmitter from 'events';
import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

config();
const events = new EventEmitter();
let _sensorData, db, _client;

MongoClient.connect(
  process.env.MONGODB_URI,
  { useNewUrlParser: true },
  (err, client) => {
    if (err) {
      console.error(err);
    } else {
      _client = client;
      db = client.db();
    }
  },
);

events.on('init', (state) => {
  db.collection('games').insertOne({ id: state.id, state });
});

events.on('win', (winner: string, state: GameState) => {
  const { elapsed } = state;
  // eslint-disable-next-line no-console
  console.log(winner, 'has won! It took', elapsed);
});

events.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error(err);
});

events.on('pause', (sensorData: SensorData) => {
  _sensorData = sensorData;
});

const render = (state: GameState) => {
  if (_sensorData) {
    db.collection('games').updateOne(
      { id: state.id },
      { $set: { sensorData: _sensorData, state } },
    );
    _client.close();
  }
};

const dbFrontend = { render, events };

export default dbFrontend;
