//@flow

import { hexagon } from '../sprites';
import HexMatrix from '../HexMatrix';

const wall = (ctx, proximityData) => {
  const { location } = proximityData;
  const hex = new HexMatrix().translateLocation(location).defaultScale();
  const field = new Path2D();
  field.addPath(hexagon, hex);
  ctx.fillStyle = 'gray';
  ctx.fill(field);
};

export default wall;
