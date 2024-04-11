import getSquarePosition from "./getSquarePosition.js";

export default function getBoxFacePosition2(n, N) {
  const x = Math.random() * 2 - 1;
  const y = Math.random() * 2 - 1;
  const z = Math.random() * 2 - 1;

  const index = Math.floor(Math.random() * 6);
  switch (index) {
    case 0:
      return {
        x,
        y,
        z: 1,
      };
    case 1:
      return {
        x,
        y,
        z: -1,
      };
    case 2:
      return {
        x,
        y: -1,
        z,
      };
    case 3:
      return {
        x,
        y: 1,
        z,
      };
    case 4:
      return {
        x: 1,
        y,
        z,
      };
    case 5:
      return {
        x: -1,
        y,
        z,
      };
  }
}

function getBoxFacePosition(n, N) {
  const faceCount = Math.ceil(N / 6);
  // 通过n计算在第几个面
  const face = Math.floor(n / faceCount);
  // 通过n计算在面的第几个
  const faceIndex = n % faceCount;
  const { x, y } = getSquarePosition(faceIndex, faceCount);
  switch (face) {
    case 0:
      return {
        x,
        y,
        z: 1,
      };
    case 1:
      return {
        x: -x,
        y: -y,
        z: -1,
      };
    case 2:
      return {
        x: x,
        y: -1,
        z: y,
      };
    case 3:
      return {
        x: -x,
        y: 1,
        z: -y,
      };
    case 4:
      return {
        x: 1,
        y: x,
        z: -y,
      };
    case 5:
      return {
        x: -1,
        y: -x,
        z: y,
      };
  }
}
