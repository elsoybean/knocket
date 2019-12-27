//@flow

import { DynamoDB } from 'aws-sdk';

const findBattleByConnectionId = async (id: string) => {
  const docClient = new DynamoDB.DocumentClient();
  const { env: { TABLE_NAME: TableName = 'KnocketBattles' } = {} } = process;
  const params = {
    TableName,
    FilterExpression: 'contains(connectionIds, :connection_id)',
    ExpressionAttributeValues: { ':connection_id': id },
    ProjectionExpression: 'state',
  };
  try {
    const result = await docClient.scan(params).promise();
    console.log('Finding by connection', { id, params, result });
    const {
      Items: [{ state }],
    } = result;
    return state;
  } catch (err) {
    console.error('Error finding battle', err);
  }
};

export default findBattleByConnectionId;
