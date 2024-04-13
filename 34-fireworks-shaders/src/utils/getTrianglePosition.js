export default function calculatePointCoordinates(n, N) {
  // 定义正三棱锥的顶点坐标
  const A = { x: Math.sqrt(3) / 2, y: 0, z: -1 / (2 * Math.sqrt(3)) };
  const B = { x: -Math.sqrt(3) / 4, y: 3 / 4, z: -1 / (2 * Math.sqrt(3)) };
  const C = { x: -Math.sqrt(3) / 4, y: -3 / 4, z: -1 / (2 * Math.sqrt(3)) };
  const D = { x: 0, y: 0, z: Math.sqrt(6) / 3 };

  // 定义正三棱锥的边
  const edges = [
    [A, B],
    [B, C],
    [C, A],
    [A, D],
    [B, D],
    [C, D],
  ];

  // 计算每条边的基础点数和额外点数
  const basePointsPerEdge = Math.floor(N / edges.length);
  const extraPoints = N % edges.length;

  // 确定点n所在的边
  let totalPointsBeforeCurrentEdge = 0;
  let edgeIndex = 0;
  for (; edgeIndex < edges.length; edgeIndex++) {
    let pointsOnCurrentEdge =
      basePointsPerEdge + (edgeIndex < extraPoints ? 1 : 0);
    if (n <= totalPointsBeforeCurrentEdge + pointsOnCurrentEdge) {
      break;
    }
    totalPointsBeforeCurrentEdge += pointsOnCurrentEdge;
  }

  const edge = edges[edgeIndex];
  const pointsOnCurrentEdge =
    basePointsPerEdge + (edgeIndex < extraPoints ? 1 : 0);
  const positionInEdge =
    (n - totalPointsBeforeCurrentEdge - 1) / pointsOnCurrentEdge;

  // 计算并返回点的坐标
  const point = {
    x: edge[0].x + (edge[1].x - edge[0].x) * positionInEdge,
    y: edge[0].y + (edge[1].y - edge[0].y) * positionInEdge,
    z: edge[0].z + (edge[1].z - edge[0].z) * positionInEdge,
  };

  return point;
}
