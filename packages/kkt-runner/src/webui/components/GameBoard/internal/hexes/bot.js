//@flow

import hexToRgba from 'hex-to-rgba';
import HexMatrix from '../HexMatrix';
import { hexagon, robot } from '../sprites';
import { THICKNESS } from '../constants';

const bot = (ctx, proximityData): void => {
  const { location, color, damage, heading } = proximityData;
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
  const hex = new HexMatrix().translateLocation(location).defaultScale();
  const rotateMatrix = new HexMatrix().rotate(60 * ((heading - 4) % 6));
  const rotatedBot = new Path2D();
  rotatedBot.addPath(robot, rotateMatrix);
  const inside = new Path2D();
  inside.addPath(rotatedBot, hex);
  ctx.fill(inside);

  const outside = new Path2D();
  outside.addPath(hexagon, hex);
  ctx.strokeStyle = color;
  ctx.lineWidth = THICKNESS / 2;
  ctx.stroke(inside);
  ctx.lineWidth = THICKNESS;
  ctx.stroke(outside);
};

export default bot;
