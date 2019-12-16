// @flow
import { start as startBattle } from 'kkt-battle';
import { DynamoDB } from 'aws-sdk';

const handler = async (event) => {
  const { body = '{}', requestContext: { connectionId } = {} } = event;
  try {
    const { config: gameConfig = { botConfigs: [] } } = JSON.parse(body);
    gameConfig.botConfigs.push({
      color: 'green',
      strategy: { type: 'offline' },
    });

    const state = await startBattle({ gameConfig });
    const { id } = state;

    const { env: { TABLE_NAME = 'KnocketBattles' } = {} } = process;
    const ddb = new DynamoDB();
    const params = {
      TableName: TABLE_NAME,
      Item: {
        ...state,
        connectionId,
      },
    };
    await ddb.putItem(params).promise();

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
