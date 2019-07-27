//@flow

import EventEmitter from 'events';
import { initializeField } from './field';
import { initializeBot } from './bot';
import * as moves from './moves';

import type { Bot, GameState, BattleOptions } from '../types/GameState.types';
import type { Move } from '../types/Move.types';

const battle = async ({
  gameConfig: { fieldSize = 5, botConfigs = [] },
  frontend: { render, events = new EventEmitter() },
}: BattleOptions): Promise<void> => {
  try {
    const field = initializeField(fieldSize);
    const bots = botConfigs.map((config) =>
      initializeBot(field, config, events),
    );

    const state: GameState = {
      elapsed: 0,
      field,
      bots,
    };

    const applyMove = async (
      bot: Bot,
      move: ?Move,
      state: GameState,
    ): Promise<void> => {
      const { type = 'wait', options } = move || {};
      const moveType =
        type && Object.keys(moves).includes(type) ? type : 'wait';
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

    events.emit('init');
    if (render) {
      await render(state);
    }

    while (keepRunning) {
      const { bots } = state;
      const aliveBots = bots.filter((bot) => bot.health > 0);
      if (aliveBots.length == 1) {
        const { color: winner } = aliveBots[0];
        events.emit('win', winner, state);
        keepRunning = false;
      } else {
        const activeBot = bots.sort((a, b) => a.cooldown - b.cooldown)[0];
        const { cooldown: elapsed } = activeBot;
        state.elapsed += elapsed;
        bots.forEach((bot) => {
          bot.cooldown -= elapsed;
        });
        const { strategy } = activeBot;
        const move = await strategy();
        await applyMove(activeBot, move, state);
        if (render) {
          await render(state);
        }
      }
    }

    events.emit('done');
  } catch (err) {
    events.emit('error', err);
  }
};

export default battle;
