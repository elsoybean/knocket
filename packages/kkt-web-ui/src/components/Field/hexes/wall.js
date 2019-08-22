//@flow

import { hexagon } from '../sprites';
import HexMatrix from '../HexMatrix';

const wall = (ctx, proximityData, size) => {
  const { location } = proximityData;
  const hex = new HexMatrix()
    .translateLocation(size, location)
    .defaultScale(size);
  const field = new Path2D();
  field.addPath(hexagon, hex);
  ctx.fillStyle = 'gray';
  ctx.fill(field);
};

export default wall;
