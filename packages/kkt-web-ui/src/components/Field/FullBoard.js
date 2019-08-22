//@flow

import React, { useRef, useEffect } from 'react';
import _isEqual from 'lodash/isEqual';
import { WIDTH, HEIGHT } from './constants';
import { none as noneHex, bot as botHex } from './hexes';

import type { GameState } from '../../../../kkt-battle/types/GameState.types';

type Props = {
  state: GameState,
  size: number,
};

const FullBoard = ({ state = {}, size }: Props) => {
  const fieldRef = useRef(null);

  useEffect(() => {
    const canvas = fieldRef.current;
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width / 2, canvas.height / 2);
  }, []);

  useEffect(() => {
    const canvas = fieldRef.current;
    const ctx = canvas.getContext('2d');

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    const { field = [], bots = [] } = state;

    field.forEach((location) => {
      const bot = bots.find((bot) => _isEqual(bot.position, location));
      if (bot) {
        const { color, health, heading } = bot;
        const damage =
          health == 0
            ? 'total'
            : health <= 50
              ? 'major'
              : health <= 90
                ? 'minor'
                : 'none';
        botHex(ctx, { color, damage, location, heading }, size);
      } else {
        noneHex(ctx, { location }, size);
      }
    });
  }, [state]);

  return (
    <canvas
      style={{ position: 'absolute' }}
      ref={fieldRef}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};

export default FullBoard;
