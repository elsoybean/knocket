//@flow

import _ from 'lodash';
import { HEADINGS } from '../constants';

import type { Bot, GameState } from '../../types/GameState.types';
import type { AheadOptions } from '../../types/Move.types';

const ahead = async (
  bot: Bot,
  state: GameState,
  _options_?: AheadOptions,
): Promise<number> => {
  const { position, heading } = bot;
  const { field, bots } = state;
  const newPosition = _.mergeWith({}, position, HEADINGS[heading], _.add);
  if (
    field.find((p) => _.isEqual(p, newPosition)) &&
    !bots.find((otherBot) => _.isEqual(otherBot.position, newPosition))
  ) {
    bot.position = newPosition;
  }
  return 4 + 2 * Math.random();
};

export default ahead;
