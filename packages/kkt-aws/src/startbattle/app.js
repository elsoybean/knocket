// @flow
import { start as startBattle } from 'kkt-battle';
import { DynamoDB, SQS } from 'aws-sdk';

const saveBattle = async ({ id, state, connectionId }) => {
  const { env: { TABLE_NAME: TableName = 'KnocketBattles' } = {} } = process;
  const docClient = new DynamoDB.DocumentClient();
  const params = {
    TableName,
    Item: {
      id,
      connectionId,
      state,
    },
  };
  await docClient.put(params).promise();
};

const publishBattle = async (id) => {
  const { env: { QUEUE_URL: QueueUrl } = {} } = process;
  const sqs = new SQS();
  const params = {
    MessageAttributes: {
      BattleId: {
        DataType: 'String',
        StringValue: id,
      },
    },
    MessageGroupId: 'startbattle',
    MessageBody: JSON.stringify(id),
    QueueUrl,
  };

  await sqs.sendMessage(params).promise();
};

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

    await saveBattle({ id, state, connectionId });
    await publishBattle(id);

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
