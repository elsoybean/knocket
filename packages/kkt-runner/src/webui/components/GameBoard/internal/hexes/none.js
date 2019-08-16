//@flow

import { hexagon } from '../sprites';
import HexMatrix from '../HexMatrix';
import { THICKNESS } from '../constants';

const none = (ctx, proximityData) => {
  const { location } = proximityData;
  const hex = new HexMatrix().translateLocation(location).defaultScale();
  const field = new Path2D();
  field.addPath(hexagon, hex);
  ctx.strokeStyle = 'Gainsboro';
  ctx.lineWidth = THICKNESS;
  ctx.stroke(field);
};

export default none;
