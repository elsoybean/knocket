//@flow

import React, { useRef, useEffect } from 'react';
import hexToRgba from 'hex-to-rgba';

import type { SensorData } from '../../../../kkt-battle/types/GameState.types';

type Props = {
  sensorData: SensorData,
};

const WIDTH = 450,
  HEIGHT = 450,
  SIZE = 50,
  THICKNESS = 5;

const hexagon = new Path2D(
  'M 0 -22 L 19 -11 L 19 11 L 0 22 L -19 11 L -19 -11 Z',
);

const heatSensor = new Path2D('M 15 0 L 20 -3 L 20 3 Z');

const robot = new Path2D('M -10 10 L 12 0 L -10 -10 Z');

const drawBot = (
  ctx,
  hex: DOMMatrix,
  color: string,
  damage: string,
  heading: number,
): void => {
  const alpha =
    damage == 'minor'
      ? 0.66
      : damage == 'major'
      ? 0.33
      : damage == 'total'
      ? 0
      : 1;
  ctx.fillStyle = color;
  ctx.fillStyle = hexToRgba(ctx.fillStyle, alpha);
  const tmp = new Path2D();
  tmp.addPath(robot, new DOMMatrix().rotate(60 * ((heading - 4) % 6)));
  const inside = new Path2D();
  inside.addPath(tmp, hex);
  ctx.fill(inside);

  const outside = new Path2D();
  outside.addPath(hexagon, hex);
  ctx.strokeStyle = color;
  ctx.lineWidth = THICKNESS / 2;
  ctx.stroke(inside);
  ctx.lineWidth = THICKNESS;
  ctx.stroke(outside);
};

const HeadsUpDisplay = ({ sensorData }: Props) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.translate(WIDTH / 2, HEIGHT / 2);
  }, []);

  useEffect(() => {
    if (sensorData) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      const {
        proximity = [],
        heading,
        color,
        damage,
        compass = [],
      } = sensorData;

      proximity.forEach((p) => {
        const {
          location: { x, z },
          type,
          color: opponentColor,
          damage,
          heading,
        } = p;
        const dx = SIZE * (Math.sqrt(3) * x + (Math.sqrt(3) / 2) * z);
        const dy = SIZE * ((3 / 2) * z);
        const m = new DOMMatrix()
          .translate(dx, dy)
          .scale(SIZE / 22)
          .scale(0.9);
        if (type == 'none') {
          const hex = new Path2D();
          hex.addPath(hexagon, m);
          ctx.strokeStyle = 'gray';
          ctx.lineWidth = THICKNESS;
          ctx.stroke(hex);
        } else if (type == 'wall') {
          const hex = new Path2D();
          hex.addPath(hexagon, m);
          ctx.fillStyle = 'gray';
          ctx.fill(hex);
        } else if (type == 'bot') {
          drawBot(ctx, m, opponentColor, damage, heading);
        }
      });
      const defaultMatrix = new DOMMatrix().scale(SIZE / 22).scale(0.9);
      drawBot(ctx, defaultMatrix, color, damage, heading);
      ctx.fillStyle = 'orange';

      compass.forEach((c, i) => {
        if (c) {
          const h = new Path2D();
          h.addPath(
            heatSensor,
            defaultMatrix.rotate(60 * ((heading + i - 4) % 6)),
          );
          ctx.fill(h);
        }
      });
    }
  }, [sensorData]);

  return (
    <div style={{ textAlign: 'center' }}>
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />
    </div>
  );
};

export default HeadsUpDisplay;
