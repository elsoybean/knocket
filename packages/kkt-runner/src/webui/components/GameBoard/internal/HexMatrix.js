//@flow

import { SIZE } from './constants';

DOMMatrix.prototype.translateLocation = function(location: point) {
  const { x, z } = location;
  const dx = SIZE * (Math.sqrt(3) * x + (Math.sqrt(3) / 2) * z);
  const dy = SIZE * ((3 / 2) * z);
  return this.translate(dx, dy);
};

DOMMatrix.prototype.defaultScale = function() {
  return this.scale(SIZE / 22).scale(0.9);
};

export default DOMMatrix;
