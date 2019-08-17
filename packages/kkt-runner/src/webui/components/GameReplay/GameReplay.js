//@flow

import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { applyToState } from 'kkt-battle';
import { FullBoard, WIDTH, HEIGHT } from '../Field';

const TIME_SCALE = 100;

type Props = {
  history: Array<MoveItem>,
  size: number,
};

const GameReplay = ({ history = [], size = 22 }: Props) => {
  const [state, setState] = useState();
  const [step, setStep] = useState();

  useEffect(() => {
    if (step > 0) {
      const newState = _.cloneDeep(state);
      const historyItem = history[step - 1];
      applyToState(newState, historyItem);
      setState(newState);
      if (step > 1) {
        const { elapsed } = history[step - 2];
        setTimeout(() => {
          setStep(step - 1);
        }, elapsed * TIME_SCALE);
      }
    }
  }, [step]);

  useEffect(() => {
    const { state } = history.find((h) => h.type == 'initialState') || {};
    setState(state);
    if (history.length > 1) {
      const { elapsed } = history[history.length - 2];
      setTimeout(() => {
        setStep(history.length - 1);
      }, TIME_SCALE * elapsed);
    }
  }, [history]);

  return (
    <div
      style={{
        position: 'relative',
        width: WIDTH,
        height: HEIGHT,
        margin: '0 auto',
      }}
    >
      <FullBoard state={state} size={size} />
    </div>
  );
};

export default GameReplay;
