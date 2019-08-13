//@flow

import express from 'express';
import bodyParser from 'body-parser';
import dbFrontend from 'kkt-frontend-db';
import battle, { resume } from 'kkt-battle';

const app = express();

app.use(bodyParser.json());

app.post('/api/battle', async (req, res) => {
  const frontend = dbFrontend();
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

app.get('/api/battle/:id', async (req, res) => {
  const frontend = dbFrontend();
  const { params: { id } = {} } = req;
  const {
    sensorData,
    complete,
    winner: { color: winner = 'draw' } = {},
  } = await frontend.loadBattle(id);
  res.send({ id, complete, winner, sensorData });
});

app.post('/api/battle/:id', async (req, res) => {
  const frontend = dbFrontend();
  const { params: { id } = {}, body: move } = req;
  const { state, complete: alreadyComplete } = await frontend.loadBattle(id);

  if (alreadyComplete) {
    res.status(400).send({ error: 'Battle already over' });
  } else {
    let sensorData,
      winner,
      complete = false;
    frontend.events.on('pause', (data) => {
      sensorData = data;
    });
    frontend.events.on('win', (bot) => {
      complete = true;
      winner = bot.color;
    });
    frontend.events.on('draw', () => {
      complete = true;
      winner = 'draw';
    });

    await resume(state, move, frontend);

    res.send({ id, complete, winner, sensorData });
  }
});

app.listen(3000);
