//@flow

import _ from 'lodash';
import { HEADINGS } from '../../constants';

import type { GameState, HistoryItem } from '../../../types/GameState.types';

const ahead = (state: GameState, historyItem: HistoryItem, bot: Bot) => {
  const { field, bots } = state;
  const { position, heading } = bot;
  const newPosition = _.mergeWith({}, position, HEADINGS[heading], _.add);
  if (
    field.find((p) => _.isEqual(p, newPosition)) &&
    !bots.find((otherBot) => _.isEqual(otherBot.position, newPosition))
  ) {
    bot.position = newPosition;
  }
};

export default ahead;
