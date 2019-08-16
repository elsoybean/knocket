//@flow

import React, { useRef, useEffect } from 'react';
import { WIDTH, HEIGHT } from './constants';
import * as hexes from './hexes';

import type { ProximityReading } from '../../../../../../kkt-battle/types/GameState.types';

type Props = {
  proximity: Array<ProximityReading>,
};

const ProximityHexes = ({ proximity = [] }: Props) => {
  const fieldRef = useRef(null);

  useEffect(() => {
    const canvas = fieldRef.current;
    const ctx = canvas.getContext('2d');
    ctx.translate(WIDTH / 2, HEIGHT / 2);
  }, []);

  useEffect(() => {
    const canvas = fieldRef.current;
    const ctx = canvas.getContext('2d');

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    proximity.forEach((p) => {
      const { type } = p;
      hexes[type](ctx, p);
    });
  }, [proximity]);

  return (
    <canvas
      style={{ position: 'absolute' }}
      ref={fieldRef}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};

export default ProximityHexes;
