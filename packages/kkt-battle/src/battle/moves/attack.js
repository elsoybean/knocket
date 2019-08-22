//@flow

import _ from 'lodash';
import { HEADINGS } from 'kkt-common';

import type {
  Bot,
  GameState,
  HistoryItem,
} from '../../../types/GameState.types';

const attack = (bot: Bot, state: GameState): HistoryItem => {
  const { position, heading } = bot;
  const { bots } = state;
  const target = _.mergeWith({}, position, HEADINGS[heading], _.add);
  const hitBot = bots.find((otherBot) => _.isEqual(otherBot.position, target));

  let damage = 0;
  if (hitBot) {
    const base = 10 + 5 * Math.random();
    let factor = hitBot.defending ? 0.2 : hitBot.attacking ? 1.5 : 1.0;
    if (hitBot.heading == heading) {
      factor *= 2;
    }
    if (hitBot.heading == (heading + 3) % 6) {
      factor *= 0.5;
    }
    damage = Math.floor(base * factor);
  }

  const elapsed = 4 + Math.random();
  return {
    botId: bot.id,
    type: 'attack',
    elapsed,
    target: hitBot ? hitBot.id : undefined,
    damage,
  };
};

export default attack;
