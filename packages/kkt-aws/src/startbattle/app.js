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

    console.log('env', process.env);
    const { TABLE_NAME = 'KnocketBattles' } = process.env;
    const docClient = new DynamoDB.DocumentClient();
    const params = {
      TableName: TABLE_NAME,
      Item: {
        id,
        connectionId,
        state,
      },
    };
    await docClient.put(params).promise();

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
