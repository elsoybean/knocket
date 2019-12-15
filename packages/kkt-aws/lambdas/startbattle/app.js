// @flow
const { start: startBattle } = require('kkt-battle');

exports.handler = async (event) => {
  const { body: { config: gameConfig } = {} } = event;
  gameConfig.botConfigs.push({ color: 'green', strategy: { type: 'offline' } });

  const state = await startBattle({ gameConfig });
  const { id } = state;

  const response = {
    statusCode: 200,
    body: JSON.stringify({ id, state }),
  };
  return response;
};
