// @flow

import { DynamoDB } from 'aws-sdk';
import { executeMove } from 'kkt-battle';
import { applyToState } from 'kkt-battle-events';
import loadBattle from '../common/loadBattle';
import publishBattle from '../common/publishBattle';

const updateBattleState = async (state) => {
  const { env: { TABLE_NAME: TableName = 'KnocketBattles' } = {} } = process;
  const docClient = new DynamoDB.DocumentClient();
  const { id } = state;
  const params = {
    TableName,
    Key: { id },
    UpdateExpression: 'set #s = :state',
    ExpressionAttributeNames: { '#s': 'state' },
    ExpressionAttributeValues: { ':state': state },
  };
  await docClient.update(params).promise();
};

exports.handler = async (event) => {
  const { Records = [] } = event;

  for (const { body } of Records) {
    let parsedBody = {};
    try {
      parsedBody = JSON.parse(body);
    } catch (err) {
      console.error('Apply move message is not valid JSON', body);
      return;
    }

    const { battleId, bot, bot: { id: movingId } = {}, move } = parsedBody;
    if (!battleId) {
      console.error('No battle ID; discarding message', battleId);
      return;
    }

    const { state } = (await loadBattle(battleId)) || {};
    if (!state) {
      console.error('Could not load battle; discarding message');
      return;
    }

    const { bots, elapsed } = state;
    const aliveBots = bots.filter((bot) => bot.health > 0);
    const { id: activeId } =
      aliveBots.sort((a, b) => a.cooldown - b.cooldown)[0] || {};
    if (
      elapsed > 2000 ||
      aliveBots.length < 2 ||
      !activeId ||
      movingId !== activeId
    ) {
      console.warn('Ignoring unexpected move', {
        elapsed,
        numAlive: aliveBots.length,
        activeId,
        movingId,
      });
      return;
    }

    console.debug('Applying move', { movingId, move });
    const historyItem = executeMove(bot, move, state);
    applyToState(state, historyItem);
    await updateBattleState(state);
    await publishBattle(battleId);
  }
};
