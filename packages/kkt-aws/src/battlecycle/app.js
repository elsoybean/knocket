// @flow

import { battleCycle } from 'kkt-battle';
import { DynamoDB } from 'aws-sdk';

const docClient = new DynamoDB.DocumentClient();
const { env: { TABLE_NAME: TableName = 'KnocketBattles' } = {} } = process;

const loadBattle = async (id) => {
  const params = { TableName, Key: { id }, AttributesToGet: ['state'] };
  try {
    const {
      Item: { state },
    } = await docClient.get(params).promise();
    return state;
  } catch (err) {
    console.error('Error loading battle', err);
  }
};

exports.handler = async (event) => {
  const { Records = [] } = event;
  Records.forEach(async ({ body: id }) => {
    const state = loadBattle(id);
    console.log('Current Battle State', state);
    const result = await battleCycle(state);
    console.log('Result', result);
  });
  console.log(event);
};
