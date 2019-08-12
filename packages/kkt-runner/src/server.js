//@flow

import express from 'express';
import bodyParser from 'body-parser';
import frontend from 'kkt-frontend-db';
import battle, { resume } from 'kkt-battle';

const app = express();

app.use(bodyParser.json());

app.post('/battle', async (req, res) => {
  const gameConfig = req.body;
  let sensorData = {},
    id;
  gameConfig.botConfigs.push({ color: 'green', strategy: { type: 'offline' } });

  frontend.events.on('init', (data) => {
    ({ id } = data);
  });

  frontend.events.on('pause', (data) => {
    sensorData = data;
  });

  await battle({
    gameConfig,
    frontend,
  });

  res.send({ id, sensorData });
});

app.listen(3000);
