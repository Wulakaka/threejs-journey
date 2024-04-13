export default function getCirclePosition(n, N) {
  const r = 1;
  const z = 0;
  const alpha = Math.random() * 2 * Math.PI;
  const x = Math.cos(alpha) * r;
  const y = Math.sin(alpha) * r;
  return {
    x,
    y,
    z,
  };
}
