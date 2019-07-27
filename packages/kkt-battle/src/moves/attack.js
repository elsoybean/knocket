//@flow

import _ from 'lodash';
import { HEADINGS } from '../constants';

import type { Bot, GameState } from '../../types/GameState.types';
import type { AttackOptions } from '../../types/Move.types';

const attack = async (
  bot: Bot,
  state: GameState,
  _options_?: AttackOptions,
): Promise<number> => {
  const { position, heading } = bot;
  const { bots } = state;
  const target = _.mergeWith({}, position, HEADINGS[heading], _.add);
  const hitBot = bots.find((otherBot) => _.isEqual(otherBot.position, target));
  if (hitBot) {
    const damage = Math.floor(20 + 20 * Math.random());
    hitBot.health = Math.max(0, hitBot.health - damage);
  }

  return 1.5 + Math.random();
};

export default attack;
