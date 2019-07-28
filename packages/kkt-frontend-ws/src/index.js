//@flow

import EventEmitter from 'events';

const render = () => {};
const events = new EventEmitter();

const ws = { render, events };

export default ws;
