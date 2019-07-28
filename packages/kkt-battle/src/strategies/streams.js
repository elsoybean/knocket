//@flow

// $FlowFixMe - events does in fact export once
import readline from 'readline';

import type { EventEmitter } from 'events';
import type { Move } from '../../types/Move.types';

const COMMAND_MAP: { [string]: Move } = {
  ahead: { type: 'ahead' },
  attack: { type: 'attack' },
  wait: { type: 'wait' },
  rotatecw: { type: 'rotate', options: { clockwise: true } },
  rotateccw: { type: 'rotate', options: { clockwise: false } },
};

const streams = ({
  input,
  output,
  events,
}: {
  input: ReadableStream,
  output: WritableStream,
  events: EventEmitter,
}) => {
  const rl = readline.createInterface({ input, output });

  events.on('done', rl.close);
  events.on('error', rl.close);

  const getCommand = (sensorData: SensorData): Promise<string> =>
    new Promise((resolve) => {
      rl.question(JSON.stringify(sensorData) + '\n', resolve);
    });

  return async (sensorData: SensorData): Promise<?Move> => {
    const command = await getCommand(sensorData);
    return COMMAND_MAP[command] || COMMAND_MAP['wait'];
  };
};

export default streams;
