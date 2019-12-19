// @flow

import { battleCycle } from 'kkt-battle';
import { DynamoDB } from 'aws-sdk';

const docClient = new DynamoDB.DocumentClient();
const { env: { TABLE_NAME: TableName = 'KnocketBattles' } = {} } = process;

const loadBattle = async (id) => {
  const params = { TableName, Key: { id }, AttributesToGet: ['state'] };
  try {
    const result = await docClient.get(params).promise();
    console.log('Lookup Result', id, result);
    const {
      Item: { state },
    } = result;
    return state;
  } catch (err) {
    console.error('Error loading battle', err);
  }
};

exports.handler = async (event) => {
  const { Records = [] } = event;
  Records.forEach(async ({ body: id }) => {
    try {
      const state = await loadBattle(id);
      console.log('Current Battle State', state);
      const result = await battleCycle(state);
      console.log('Result', result);
    } catch (err) {
      console.error('Error running a battle cycle', id, err);
    }
  });
  console.log(event);
};
