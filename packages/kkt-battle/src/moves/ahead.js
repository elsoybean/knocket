//@flow

import _ from 'lodash';
import { HEADINGS } from '../constants';

import type { Bot, GameState, HistoryItem } from '../../types/GameState.types';
import type { AheadOptions } from '../../types/Move.types';

const ahead = async (
  bot: Bot,
  state: GameState,
  _options_?: AheadOptions,
): Promise<HistoryItem> => {
  const { position, heading } = bot;
  const { field, bots } = state;
  const newPosition = _.mergeWith({}, position, HEADINGS[heading], _.add);
  let type = 'wait';
  if (
    field.find((p) => _.isEqual(p, newPosition)) &&
    !bots.find((otherBot) => _.isEqual(otherBot.position, newPosition))
  ) {
    bot.position = newPosition;
    type = 'ahead';
  }
  const elapsed = 1.5 + Math.random();
  return { botId: bot.id, elapsed, type };
};

export default ahead;
