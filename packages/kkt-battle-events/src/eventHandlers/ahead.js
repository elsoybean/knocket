//@flow

import _mergeWith from 'lodash/mergeWith';
import _isEqual from 'lodash/isEqual';
import _add from 'lodash/add';
import { HEADINGS } from 'kkt-common';

import type {
  GameState,
  HistoryItem,
} from '../../../kkt-battle/types/GameState.types';

const ahead = (state: GameState, historyItem: HistoryItem, bot: Bot) => {
  const { field, bots } = state;
  const { position, heading } = bot;
  const newPosition = _mergeWith({}, position, HEADINGS[heading], _add);
  if (
    field.find((p) => _isEqual(p, newPosition)) &&
    !bots.find((otherBot) => _isEqual(otherBot.position, newPosition))
  ) {
    bot.position = newPosition;
  }
};

export default ahead;
