//@flow

import { hexagon } from '../sprites';
import HexMatrix from '../HexMatrix';

const none = (ctx, proximityData, size) => {
  const thickness = Math.floor(size / 10);
  const { location } = proximityData;
  const hex = new HexMatrix()
    .translateLocation(size, location)
    .defaultScale(size);
  const field = new Path2D();
  field.addPath(hexagon, hex);
  ctx.strokeStyle = 'Gainsboro';
  ctx.lineWidth = thickness;
  ctx.stroke(field);
};

export default none;
