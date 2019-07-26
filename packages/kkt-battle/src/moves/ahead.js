//@flow

import { areEqual, addPoints } from '../util';
import { HEADINGS } from '../constants';

import type { Bot, GameState } from '../../types/GameState.types';
import type { AheadOptions } from '../../types/Move.types';

const ahead = async (
  bot: Bot,
  state: GameState,
  _options_?: AheadOptions,
): Promise<number> => {
  const { field, bots } = state;
  const newPosition = addPoints(bot.position, HEADINGS[bot.heading]);
  if (
    field.find((p) => areEqual(p, newPosition)) &&
    !bots.find((otherBot) => areEqual(otherBot.position, newPosition))
  ) {
    bot.position = newPosition;
  }
  return 4 + 2 * Math.random();
};

export default ahead;
