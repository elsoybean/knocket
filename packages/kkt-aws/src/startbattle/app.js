// @flow
import { start as startBattle } from 'kkt-battle';

const handler = async (event) => {
  const { body = '{}' } = event;
  try {
    const { config: gameConfig = { botConfigs: [] } } = JSON.parse(body);
    gameConfig.botConfigs.push({
      color: 'green',
      strategy: { type: 'offline' },
    });

    const state = await startBattle({ gameConfig });
    const { id } = state;

    const response = {
      statusCode: 200,
      body: JSON.stringify({ id, state }),
    };
    return response;
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: JSON.stringify('Error starting battle') };
  }
};

export { handler };
