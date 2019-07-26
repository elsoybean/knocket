//@flow

import EventEmitter from 'events';
import { areEqual } from './util';
import { initializeField } from './field';
import { initializeBot } from './bot';
import * as moves from './moves';

import type { Bot, BotConfig, GameState } from '../types/GameState.types';
import type { Move } from '../types/Move.types';

const FIELD_SIZE = 5;

const botConfigs: Array<BotConfig> = [
  { color: 'red', strategy: { type: 'random' } },
  { color: 'blue', strategy: { type: 'input' } },
];

const battle = async (
  render: (GameState) => Promise<void>,
  events: EventEmitter,
  postRoundHook: (boolean) => Promise<void>,
): Promise<void> => {
  const field = initializeField(FIELD_SIZE);
  const bots = botConfigs.map((config) => initializeBot(field, config, events));

  const state: GameState = {
    field,
    bots,
  };

  const applyMove = async (
    bot: Bot,
    move: ?Move,
    state: GameState,
  ): Promise<void> => {
    const { type = 'wait', options } = move || {};
    const moveType = type && Object.keys(moves).includes(type) ? type : 'wait';
    const moveFunction = moves[moveType];
    // $FlowFixMe - The options will be the right type, but flow can't tell that
    bot.cooldown = await moveFunction(bot, state, options);
  };

  let keepRunning = true;

  events.on('input', (command: string) => {
    if (command === 'quit') {
      keepRunning = false;
    }
  });

  let totalElapsed = 0;
  while (keepRunning) {
    await render(state);

    const { bots } = state;
    const aliveBots = bots.filter((bot) => bot.health > 0);
    if (aliveBots.length == 1) {
      const { color: winner } = aliveBots[0];
      events.emit('win', winner, totalElapsed);
      keepRunning = false;
    } else {
      const activeBot = bots.sort((a, b) => a.cooldown - b.cooldown)[0];
      const { cooldown: elapsed } = activeBot;
      totalElapsed += elapsed;
      bots.forEach((bot) => {
        bot.cooldown -= elapsed;
      });
      const { strategy } = activeBot;
      const move = await strategy();
      await applyMove(activeBot, move, state);
    }

    await postRoundHook(keepRunning);
  }
};

export default battle;
export { areEqual };
