//@flow

import { DynamoDB } from 'aws-sdk';

const loadBattle = async (id: string) => {
  const docClient = new DynamoDB.DocumentClient();
  const { env: { TABLE_NAME: TableName = 'KnocketBattles' } = {} } = process;
  const params = { TableName, Key: { id }, AttributesToGet: ['state'] };
  try {
    const result = await docClient.get(params).promise();
    const {
      Item: { id, connectionIds, state },
    } = result;
    return { id, connectionIds, state };
  } catch (err) {
    console.error('Error loading battle', err);
  }
};

export default loadBattle;
