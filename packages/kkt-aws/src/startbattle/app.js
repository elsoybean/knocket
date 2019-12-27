// @flow
import { start as startBattle } from 'kkt-battle';
import { DynamoDB } from 'aws-sdk';
import publishBattle from '../common/publishBattle';

const saveBattle = async ({ id, state, connectionIds }) => {
  const { env: { TABLE_NAME: TableName = 'KnocketBattles' } = {} } = process;
  const docClient = new DynamoDB.DocumentClient();
  const params = {
    TableName,
    Item: {
      id,
      connectionIds,
      state,
    },
  };
  await docClient.put(params).promise();
};

const handler = async (event) => {
  const { body = '{}', requestContext: { connectionId } = {} } = event;
  try {
    const { config: gameConfig = { botConfigs: [] } } = JSON.parse(body);
    gameConfig.botConfigs.push({
      color: 'green',
      strategy: { type: 'offline', options: { handle: connectionId } },
    });

    const state = await startBattle({ gameConfig });
    const { id } = state;

    await saveBattle({ id, state, connectionIds: [connectionId] });
    await publishBattle(state);

    const response = {
      statusCode: 200,
      body: JSON.stringify({ id }),
    };
    return response;
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: JSON.stringify('Error starting battle') };
  }
};

export { handler };
