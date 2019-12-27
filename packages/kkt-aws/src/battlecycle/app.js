// @flow

import { battleCycle } from 'kkt-battle';
import { ApiGatewayManagementApi } from 'aws-sdk';
import loadBattle from '../common/loadBattle';
import publishMove from '../common/publishMove';

import type {
  Bot,
  GameState,
  SensorData,
} from '../../../kkt-battle/types/GameState.types';
import type { Move } from '../../../kkt-battle/types/Move.types';

const { env: { WS_ENDPOINT: wsEndpoint } = {} } = process;

const collectMove = async (handle: string, sensorData: SensorData) => {
  const params = {
    ConnectionId: handle,
    Data: JSON.stringify({ type: 'collect', sensorData }),
  };
  try {
    console.log('Collecting Move', params);
    const api = new ApiGatewayManagementApi({ endpoint: wsEndpoint });
    await api.postToConnection(params).promise();
  } catch (err) {
    console.error('Error collecting next move from WS', err);
  }
};

const publishMoveForBattle = (battleId: string) => async (
  bot: Bot,
  move: Move,
) => publishMove({ battleId, bot, move });

const broadcastResult = (battleId: string) => async ({
  result,
  bot,
  state,
}: {
  result: string,
  bot?: Bot,
  state: GameState,
}) => {
  console.log('Broadcasting Result', { battleId, result, bot, state });
};

exports.handler = async (event) => {
  const { Records = [] } = event;
  for (const { body: id } of Records) {
    try {
      const { state } = (await loadBattle(id)) || {};
      if (!state) {
        console.error('Could not load battle', id);
      } else {
        await battleCycle(state, {
          collectMove,
          publishMove: publishMoveForBattle(id),
          broadcastResult: broadcastResult(id),
        });
      }
    } catch (err) {
      console.error('Error running a battle cycle', id, err);
    }
  }
};
