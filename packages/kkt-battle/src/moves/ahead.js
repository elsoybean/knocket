//@flow

import { areEqual, addPoints } from '../util';
import { HEADINGS } from '../constants';

import type { Bot, GameState } from '../../types/GameState.types';
import type { AheadOptions } from '../../types/Move.types';

const ahead = (bot: Bot, state: GameState, _options_?: AheadOptions) => {
  const { field, bots } = state;
  const newPosition = addPoints(bot.position, HEADINGS[bot.heading]);
  if (
    field.find((p) => areEqual(p, newPosition)) &&
    !bots.find((otherBot) => areEqual(otherBot.position, newPosition))
  ) {
    bot.position = newPosition;
  }
};

export default ahead;
