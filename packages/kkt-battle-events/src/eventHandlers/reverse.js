//@flow

import _mergeWith from 'lodash/mergeWith';
import _isEqual from 'lodash/isEqual';
import _add from 'lodash/add';
import { HEADINGS } from 'kkt-common';

import type {
  Bot,
  GameState,
  HistoryItem,
} from '../../../kkt-battle/types/GameState.types';

const reverse = (state: GameState, historyItem: HistoryItem, bot: Bot) => {
  const { position, heading } = bot;
  const { field, bots } = state;
  const newPosition = _mergeWith(
    {},
    position,
    HEADINGS[(heading + 3) % 6],
    _add,
  );
  if (
    field.find((p) => _isEqual(p, newPosition)) &&
    !bots.find((otherBot) => _isEqual(otherBot.position, newPosition))
  ) {
    bot.position = newPosition;
  }
};

export default reverse;
