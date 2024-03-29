export function getAngle(dy: number, dx: number) {
  return ((Math.atan2(-dx, dy) * 180) / Math.PI + 360) % 360;
}

export function getDelta(center: { x: number, y: number }, position: { x: number, y: number }) {
  return {
    x: center.x - position.x,
    y: center.y - position.y
  }
}

export function polarToCartesian(center: { x: number, y: number }, radius: number, angleInDegrees: number) {
  var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

  return {
    x: center.x + (radius * Math.cos(angleInRadians)),
    y: center.y + (radius * Math.sin(angleInRadians))
  };
}

export function describeArc(center: { x: number, y: number }, radius: number, startAngle: number, endAngle: number) {

  var start = polarToCartesian(center, radius, endAngle);
  var end = polarToCartesian(center, radius, startAngle);

  var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

  var d = [
    "M", start.x, start.y,
    "A", radius, radius, 0, arcSweep, 0, end.x, end.y
  ].join(" ");

  return d;
}

export function degreeToFloat(degree: number) {
  return (degree / 360);
}

export function floatToDegree(float: number) {
  const value = Math.min(Math.max(float, 0), 1);
  return value * 360;
}