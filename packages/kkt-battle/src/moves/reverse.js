//@flow

import _ from 'lodash';
import { HEADINGS } from '../constants';

import type { Bot, GameState, HistoryItem } from '../../types/GameState.types';

const reverse = async (bot: Bot, state: GameState): Promise<HistoryItem> => {
  const { position, heading } = bot;
  const { field, bots } = state;
  const newPosition = _.mergeWith(
    {},
    position,
    HEADINGS[(heading + 3) % 6],
    _.add,
  );
  let type = 'wait';
  if (
    field.find((p) => _.isEqual(p, newPosition)) &&
    !bots.find((otherBot) => _.isEqual(otherBot.position, newPosition))
  ) {
    bot.position = newPosition;
    type = 'reverse';
  }
  const elapsed = 1.5 + Math.random();
  return { botId: bot.id, elapsed, type };
};

export default reverse;
