//@flow

DOMMatrix.prototype.translateLocation = function(
  size: number,
  location: point,
) {
  const { x, z } = location;
  const dx = size * (Math.sqrt(3) * x + (Math.sqrt(3) / 2) * z);
  const dy = size * ((3 / 2) * z);
  return this.translate(dx, dy);
};

DOMMatrix.prototype.defaultScale = function(size: number) {
  return this.scale(size / 22).scale(0.9);
};

export default DOMMatrix;
