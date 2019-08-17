//@flow

import hexToRgba from 'hex-to-rgba';
import HexMatrix from '../HexMatrix';
import { hexagon, robot } from '../sprites';

const bot = (ctx, proximityData, size): void => {
  const thickness = Math.floor(size / 10);
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
  const hex = new HexMatrix()
    .translateLocation(size, location)
    .defaultScale(size);
  const rotateMatrix = new HexMatrix().rotate(60 * ((heading - 4) % 6));
  const rotatedBot = new Path2D();
  rotatedBot.addPath(robot, rotateMatrix);
  const inside = new Path2D();
  inside.addPath(rotatedBot, hex);
  ctx.fill(inside);

  const outside = new Path2D();
  outside.addPath(hexagon, hex);
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness / 2;
  ctx.stroke(inside);
  ctx.lineWidth = thickness;
  ctx.stroke(outside);
};

export default bot;
