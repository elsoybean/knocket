//@flow

import _ from 'lodash';
import { HEADINGS } from '../constants';

import type {
  Bot,
  GameState,
  SensorData,
  DamageEstimate,
} from '../../types/GameState.types';

const estimateDamage = (bot: Bot): DamageEstimate => {
  const { health } = bot;
  if (health <= 0) {
    return 'total';
  }
  if (health <= 40 + 20 * Math.random()) {
    return 'major';
  }
  if (health <= 85 + 10 * Math.random()) {
    return 'minor';
  }
  return 'none';
};

const readSensors = (bot: Bot, state: GameState): SensorData => {
  const { field, bots, elapsed, history } = state;
  const heading = HEADINGS[bot.heading];

  const visible = [heading];
  const proximity = visible.map((h) => {
    const newPosition = _.mergeWith({}, bot.position, h, _.add);
    if (!field.find((p) => _.isEqual(p, newPosition))) {
      return { location: h, type: 'wall' };
    }
    const otherBot = bots.find((b) => _.isEqual(b.position, newPosition));
    if (otherBot) {
      return { location: h, type: 'bot', damage: estimateDamage(otherBot) };
    }
    return { location: h, type: 'none' };
  });

  const damage = estimateDamage(bot);

  const reading = { elapsed, proximity, damage, heading };
  const previousReadings = [...bot.sensorMemory];
  bot.sensorMemory = [reading, ...previousReadings].slice(0, 3);

  const lastMove = _.findIndex(history, (h) => h.botId == bot.id);
  const damages = _(history)
    .filter(
      (h, i) =>
        h.damage > 0 &&
        (h.botId == bot.id || h.target == bot.id) &&
        i <= lastMove,
    )
    .map((h) => ({ attacker: h.botId, target: h.target, type: h.type }))
    .value();

  return { ...reading, previousReadings, damages };
};

export default readSensors;
