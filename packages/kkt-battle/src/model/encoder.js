//@flow

const DAMAGE_ESTIMATES = ['none', 'minor', 'major', 'total'];
const ACTIONS = [
  'attack',
  'rotatecw',
  'rotateccw',
  'ahead',
  'reverse',
  'wait',
  'defend',
];
const PROXIMITY_TYPES = ['none', 'wall', 'bot'];

const encodeDamage = (damage: string = 'n/a') =>
  Array.from(Array(4), (d, i) => (damage == DAMAGE_ESTIMATES[i] ? 1 : 0));

const encodeHeading = (heading: number = -1) =>
  Array.from(Array(6), (d, i) => (heading == i ? 1 : 0));

const moveToAction = ({ type = 'n/a', clockwise } = {}) =>
  `${type}${type == 'rotate' ? (clockwise ? 'cw' : 'ccw') : ''}`;

const encodeMove = (move = {}) => {
  const action = moveToAction(move || {});
  return Array.from(Array(ACTIONS.length), (d, i) =>
    action == ACTIONS[i] ? 1 : 0,
  );
};

const encodeProximity = ({
  heading = -1,
  damage = 'n/a',
  lastMove = {},
  type,
} = {}) => [
  ...Array.from(Array(PROXIMITY_TYPES.length), (d, i) =>
    PROXIMITY_TYPES[i] == type ? 1 : 0,
  ),
  ...encodeHeading(heading),
  ...encodeDamage(damage),
  ...encodeMove(lastMove),
];

const encodeHeatSensor = (heatSensors = []) =>
  Array.from(Array(6), (d, i) => (heatSensors[i] ? 1 : 0));

const encodeReading = ({ proximity = [], damage, heading, compass } = {}) => [
  ...encodeProximity(proximity[0]),
  ...encodeProximity(proximity[1]),
  ...encodeProximity(proximity[2]),
  ...encodeProximity(proximity[3]),
  ...encodeDamage(damage),
  ...encodeHeading(heading),
  ...encodeHeatSensor(compass),
];

const encodeMoveHistory = (history = []) =>
  Array.from(Array(5), (d, i) => history[i] || {}).reduce(
    (acc, move = {}) => [...acc, ...encodeMove(move)],
    [],
  );

const encodeSensorData = ({
  previousReadings = [],
  damages = [],
  moveHistory = [],
  ...currentReading
}: SensorData = {}) => [
  ...encodeReading(currentReading),
  ...encodeReading(previousReadings[0] || {}),
  ...encodeReading(previousReadings[1] || {}),
  ...encodeReading(previousReadings[2] || {}),
  damages.some(({ dealt }) => dealt === true) ? 1 : 0,
  damages.some(({ dealt }) => dealt === false) ? 0 : 1,
  ...encodeMoveHistory(moveHistory),
];

export { encodeSensorData, ACTIONS };
