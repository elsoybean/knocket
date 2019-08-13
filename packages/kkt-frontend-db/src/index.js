//@flow

import EventEmitter from 'events';
import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

import type { SavedGame } from '../../kkt-battle/types/GameState.types';

let _client;

const dbFrontend = () => {
  config();
  const events = new EventEmitter();
  let sensorData;

  const connect = async () => {
    if (!_client) {
      _client = await MongoClient.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        poolSize: 10,
      });
    }
    return _client.db();
  };

  events.on('init', async (state) => {
    const db = await connect();
    await db
      .collection('games')
      .insertOne({ _id: state.id, state, complete: false });
  });

  events.on('win', async (winner: Bot, state: GameState) => {
    const db = await connect();
    await db.collection('games').updateOne(
      { _id: state.id },
      {
        $set: { state, winner, complete: true },
        $unset: { sensorData: true },
      },
    );
  });

  events.on('draw', async (state: GameState) => {
    const db = await connect();
    await db.collection('games').updateOne(
      { _id: state.id },
      {
        $set: { state, complete: true },
        $unset: { sensorData: true },
      },
    );
  });

  events.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error(err);
  });

  events.on('pause', (data: SensorData) => {
    sensorData = data;
  });

  const render = async (state: GameState) => {
    const db = await connect();
    if (sensorData) {
      await db
        .collection('games')
        .updateOne({ _id: state.id }, { $set: { sensorData, state } });
    }
  };

  const loadBattle = async (id: string): Promise<?SavedGame> => {
    const db = await connect();
    return await db.collection('games').findOne({ _id: id });
  };

  return { render, events, loadBattle };
};

export default dbFrontend;
