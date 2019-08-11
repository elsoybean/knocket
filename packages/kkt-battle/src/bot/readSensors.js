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
  const left = HEADINGS[(bot.heading + 5) % 6];
  const right = HEADINGS[(bot.heading + 1) % 6];
  const twoforward = _.mergeWith({}, heading, heading, _.add);

  const visible = [heading, left, right, twoforward];
  const proximity = visible.map((h) => {
    const newPosition = _.mergeWith({}, bot.position, h, _.add);
    if (!field.find((p) => _.isEqual(p, newPosition))) {
      return { location: h, type: 'wall' };
    }
    const otherBot = bots.find((b) => _.isEqual(b.position, newPosition));
    if (otherBot) {
      const { moveHistory: [lastMove] = [] } = otherBot;
      return {
        location: h,
        type: 'bot',
        damage: estimateDamage(otherBot),
        heading: otherBot.heading,
        lastMove,
      };
    }
    return { location: h, type: 'none' };
  });

  const compass = [false, false, false, false, false, false];
  bots.forEach((b) => {
    if (!_.isEqual(b.position, bot.position)) {
      const span = _.mergeWith({}, b.position, bot.position, _.subtract);
      const distance = _(span)
        .values()
        .map((v) => Math.abs(v))
        .max();
      const heading = _.mapValues(span, (v) => Math.trunc(v / distance) || 0);
      HEADINGS.forEach((h, idx) => {
        if (
          (!heading.x || heading.x == h.x) &&
          (!heading.y || heading.y == h.y) &&
          (!heading.z || heading.z == h.z)
        ) {
          compass[(6 + idx - bot.heading) % 6] = true;
        }
      });
    }
  });

  const damage = estimateDamage(bot);

  const reading = {
    elapsed,
    proximity,
    damage,
    heading: bot.heading,
    compass,
  };
  const previousReadings = [...bot.sensorMemory];
  bot.sensorMemory = [reading, ...previousReadings].slice(0, 3);

  const lastTurn = _.findIndex(history, (h) => h.botId == bot.id);
  const damages = _(history)
    .filter(
      (h, i) =>
        h.damage > 0 &&
        (h.botId == bot.id || h.target == bot.id) &&
        i <= lastTurn,
    )
    .map((h) => ({ type: h.type, dealt: h.botId == bot.id, amount: h.damage }))
    .value();

  const moveHistory = bot.moveHistory.slice(0, 5).map((h) => {
    // eslint-disable-next-line no-unused-vars
    const { botId: _botId_, ...rest } = h;
    return rest;
  });

  return { ...reading, previousReadings, damages, moveHistory };
};

export default readSensors;
