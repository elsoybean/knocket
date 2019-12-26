// @flow

import findBattleByConnectionId from '../common/findBattleByConnectionId';
import publishMove from '../common/publishMove';

exports.handler = async (event) => {
  const {
    body = '{}',
    requestContext: { connectionId },
  } = event;

  const state = await findBattleByConnectionId(connectionId);
  if (!state) {
    return {
      statusCode: 400,
      body: JSON.stringify(`No battle with connection ${connectionId}`),
    };
  }

  const { id: battleId, bots } = state;
  const bot = bots.find(
    ({ strategyConfig: { options: { handle } = {} } = {} }) =>
      handle === connectionId,
  );
  if (!bot) {
    return {
      statusCode: 400,
      body: JSON.stringify(`No battle with handle ${connectionId}`),
    };
  }

  const { command = 'wait' } = JSON.parse(body);
  const move =
    command === 'rotatecw'
      ? { type: 'rotate', options: { clockwise: true } }
      : command === 'rotateccw'
      ? { type: 'rotate', options: { clockwise: false } }
      : { type: command };

  await publishMove({ battleId, bot, move });
};
