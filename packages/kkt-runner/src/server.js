//@flow

import express from 'express';
import bodyParser from 'body-parser';
import dbFrontend from 'kkt-frontend-db';
import {
  start as startBattle,
  resume as resumeBattle,
  battleCycle,
  executeMove,
} from 'kkt-battle';
import { applyToState } from 'kkt-battle-events';

const app = express();

app.use(bodyParser.json());

app.post('/api/battle', async (req, res) => {
  const { render, events } = dbFrontend();
  const gameConfig = req.body;
  let sensorData = {};
  gameConfig.botConfigs.push({ color: 'green', strategy: { type: 'offline' } });

  events.on('pause', (data) => {
    sensorData = data;
  });

  const state = await startBattle({ gameConfig });
  const { id } = state;

  let keepRunning = true;
  while (keepRunning) {
    const { result, bot, sensorData } = await battleCycle(state, render);
    const {
      color,
      strategy,
      strategyConfig: { type },
    } = bot;
    console.log('Stepping through Battle', color, type);
    keepRunning = result == 'nextMove' && type != 'offline';

    // let strategy;
    // if (Math.random() < proficiency) {
    //   ({ strategy } = activeBot);
    // } else {
    //   strategy = randomStrategy;
    // }
    if (type !== 'offline') {
      const move = await strategy(sensorData);
      if (move) {
        const historyItem = executeMove(bot, move, state);
        applyToState(state, historyItem);
      }
      if (render) {
        await render(state);
      }
    }
  }

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
  const { render, events, loadBattle } = dbFrontend();
  const { params: { id } = {}, body: move } = req;
  const { state, complete: alreadyComplete } = await loadBattle(id);

  if (alreadyComplete) {
    res.status(400).send({ error: 'Battle already over' });
  } else {
    let sensorData,
      winner,
      complete = false;
    events.on('pause', (data) => {
      sensorData = data;
    });
    events.on('win', (bot) => {
      complete = true;
      winner = bot.color;
    });
    events.on('draw', () => {
      complete = true;
      winner = 'draw';
    });

    const newState = await resumeBattle(state, move);
    await battleCycle(newState, render, events);

    res.send({
      id,
      ...(complete ? { winner, state: newState } : {}),
      complete,
      sensorData,
    });
  }
});

app.use(express.static('public'));
app.use('/js', express.static('./node_modules/kkt-web-ui/lib'));

app.listen(3000);
