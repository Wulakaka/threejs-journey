export default function getSquarePosition(n, N) {
  // 每边数量
  const count = Math.ceil(Math.sqrt(N));
  // 通过n计算在第几行第几列
  const x = (n % count) / count;
  const y = Math.floor(n / count) / count;
  return {
    x: x * 2 - 1,
    y: y * 2 - 1,
    z: 0,
  };
}
