//@flow

import { readSensors, reset } from '../bot';
//import { random as randomStrategy } from '../strategies';
//import executeMove from './executeMove';
//import { applyToState } from 'kkt-battle-events';

import type { GameState } from '../../types/GameState.types';

const battleCycle = async (
  state: GameState,
  //render: RenderFunction,
  //events: EventEmitter,
) => {
  // if (render) {
  //   await render(state);
  // }

  const { bots, elapsed } = state;
  const aliveBots = bots.filter((bot) => bot.health > 0);
  if (elapsed > 2000) {
    return { result: 'draw', state };
  } else if (aliveBots.length == 1) {
    return { result: 'win', bot: aliveBots[0], state };
  } else {
    const activeBot = aliveBots.sort((a, b) => a.cooldown - b.cooldown)[0];
    const { cooldown: elapsed } = activeBot;
    state.elapsed += elapsed;
    aliveBots.forEach((bot) => {
      bot.cooldown -= elapsed;
    });
    reset(activeBot);

    const sensorData = readSensors(activeBot, state);
    return { result: 'nextMove', bot: activeBot, sensorData };

    // let strategy;
    // if (Math.random() < proficiency) {
    //   ({ strategy } = activeBot);
    // } else {
    //   strategy = randomStrategy;
    // }
    // const move = await strategy(sensorData);
    // if (move) {
    //   events.emit('moveChosen', activeBot, sensorData, move);
    //   const historyItem = executeMove(activeBot, move, state);
    //   applyToState(state, historyItem);
    // }
    // if (render) {
    //   await render(state);
    // }
  }
};

export default battleCycle;
