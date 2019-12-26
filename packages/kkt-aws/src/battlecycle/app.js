// @flow

import { v4 as uuid } from 'uuid';
import { battleCycle } from 'kkt-battle';
import { DynamoDB, ApiGatewayManagementApi, SQS } from 'aws-sdk';

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
    Data: JSON.stringify({ type: 'collect', sensorData }),
  };
  try {
    console.log('Collecting Move', params);
    const api = new ApiGatewayManagementApi();
    await api.postToConnection(params).promise();
  } catch (err) {
    console.error('Error collecting next move from WS', err);
  }
};

exports.handler = async (event) => {
  const { Records = [] } = event;
  for (const { body: id } of Records) {
    const publishMove = async (bot: Bot, move: Move) => {
      const moveId = uuid();
      const moveMessage = { battleId: id, moveId, bot, move };
      console.log('Publishing Move', moveMessage);
      try {
        const { color: botColor = '?' } = bot || {};
        const { type: moveType = '?' } = move || {};
        const { env: { QUEUE_URL: QueueUrl } = {} } = process;
        const sqs = new SQS();
        const params = {
          MessageAttributes: {
            BattleId: {
              DataType: 'String',
              StringValue: id,
            },
            MoveId: {
              DataType: 'String',
              StringValue: moveId,
            },
            BotColor: {
              DataType: 'String',
              StringValue: botColor,
            },
            MoveType: {
              DataType: 'String',
              StringValue: moveType,
            },
          },
          MessageDeduplicationId: moveId,
          MessageGroupId: 'movebot',
          MessageBody: JSON.stringify(moveMessage),
          QueueUrl,
        };
        await sqs.sendMessage(params).promise();
        console.log('Finished publishing message', params);
      } catch (err) {
        console.error('Error publishing move', err);
      }
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
      console.log('Broadcasting Result', { battleId: id, result, bot, state });
    };

    try {
      const state = await loadBattle(id);
      await battleCycle(state, {
        collectMove,
        publishMove,
        broadcastResult,
      });
    } catch (err) {
      console.error('Error running a battle cycle', id, err);
    }
  }
};
