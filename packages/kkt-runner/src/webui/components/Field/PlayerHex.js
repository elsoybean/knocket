//@flow

import React, { useRef, useEffect } from 'react';
import { bot } from './hexes';
import { WIDTH, HEIGHT } from './constants';
import { heatSensor } from './sprites';
import HexMatrix from './HexMatrix';

import type { SensorData } from '../../../../../kkt-battle/types/GameState.types';

type Props = {
  sensorData: SensorData,
  size: number,
};

const PlayerHex = ({ sensorData, size }: Props) => {
  const playerRef = useRef(null);

  useEffect(() => {
    const canvas = playerRef.current;
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width / 2, canvas.height / 2);
  }, []);

  useEffect(() => {
    if (!sensorData) {
      return;
    }
    const canvas = playerRef.current;
    const ctx = canvas.getContext('2d');

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    const { color, damage, heading, compass: heatSensors = [] } =
      sensorData || {};

    const hex = {
      location: { x: 0, y: 0, z: 0 },
      color,
      damage,
      heading,
    };

    bot(ctx, hex, size);

    ctx.fillStyle = 'orange';
    heatSensors.forEach((isOn, index) => {
      if (isOn) {
        const sensorIcon = new Path2D();
        sensorIcon.addPath(
          heatSensor,
          new HexMatrix()
            .defaultScale(size)
            .rotate(60 * ((heading + index + 2) % 6)),
        );
        ctx.fill(sensorIcon);
      }
    });
  }, [sensorData]);

  return (
    <canvas
      style={{ position: 'absolute' }}
      ref={playerRef}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};

export default PlayerHex;
