//@flow

import express from 'express';
import bodyParser from 'body-parser';
import dbFrontend from 'kkt-frontend-db';
import { start as startBattle, resume as resumeBattle } from 'kkt-battle';

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

  await startBattle({
    gameConfig,
    frontend,
  });

  res.send({ id, sensorData });
});

app.get('/api/battle/:id', async (req, res) => {
  const frontend = dbFrontend();
  const { params: { id } = {} } = req;
  const battle = await frontend.loadBattle(id);
  if (!battle) {
    res.status(404).send({ error: 'No battle with that id' });
  } else {
    const { sensorData, state, complete, winner: { color: winner } = {} } =
      battle || {};
    res.send({
      id,
      complete,
      ...(complete ? { winner: winner || 'draw', state } : {}),
      sensorData,
    });
  }
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

    await resumeBattle(state, move, frontend);

    res.send({
      id,
      ...(complete ? { winner, state } : {}),
      complete,
      sensorData,
    });
  }
});

app.use(express.static('public'));
app.use('/js', express.static('./node_modules/kkt-web-ui/lib'));
app.use('/models', express.static('../../models'));

app.listen(3000);
