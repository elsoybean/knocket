// @flow

import { battleCycle } from 'kkt-battle';
import { DynamoDB, ApiGatewayManagementApi } from 'aws-sdk';

import type {
  Bot,
  GameState,
  SensorData,
} from '../../../kkt-battle/types/GameState.types';
import type { Move } from '../../../kkt-battle/types/Move.types';

const docClient = new DynamoDB.DocumentClient();
const { env: { TABLE_NAME: TableName = 'KnocketBattles' } = {} } = process;

const loadBattle = async (id: string) => {
  const params = { TableName, Key: { id }, AttributesToGet: ['state'] };
  try {
    const result = await docClient.get(params).promise();
    console.log('Lookup Result', id, result);
    const {
      Item: { state },
    } = result;
    return state;
  } catch (err) {
    console.error('Error loading battle', err);
  }
};

const collectMove = async (handle: string, sensorData: SensorData) => {
  const params = {
    ConnectionId: handle,
    Data: JSON.stringify(sensorData),
  };
  try {
    console.log('Collecting Move', params);
    const api = new ApiGatewayManagementApi();
    await api.postToConnection(params).promise();
  } catch (err) {
    console.error('Error collecting next move from WS', err);
  }
};

const publishMove = async (bot: Bot, move: Move) => {
  console.log('Publishing Move', { bot, move });
};

const broadcastResult = async ({
  result,
  bot,
  state,
}: {
  result: string,
  bot?: Bot,
  state: GameState,
}) => {
  console.log('Broadcasting Result', { result, bot, state });
};

exports.handler = async (event) => {
  const { Records = [] } = event;
  console.log('Starting Battle Cycle', event);
  for (const { body: id } of Records) {
    try {
      console.log('Loading Battle', id);
      const state = await loadBattle(id);
      console.log('Current Battle State', state);
      await battleCycle(state, {
        collectMove,
        publishMove,
        broadcastResult,
      });
    } catch (err) {
      console.error('Error running a battle cycle', id, err);
    }
  }
  console.log(event);
};
