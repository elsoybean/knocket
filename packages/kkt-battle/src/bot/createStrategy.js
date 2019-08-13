//@flow

import * as strategies from '../strategies';

import type EventEmitter from 'events';

const createStrategy = (
  type: string,
  options: ?Object,
  events: EventEmitter,
): Strategy =>
  strategies[type]({
    ...options,
    events,
  });

export default createStrategy;
