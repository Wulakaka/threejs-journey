export default function getBoxEdgePosition() {
  const x = Math.random() * 2 - 1;
  const y = Math.random() * 2 - 1;
  const z = Math.random() * 2 - 1;

  const index = Math.floor(Math.random() * 12);

  switch (index) {
    case 0:
      return {
        x: x,
        y: 1,
        z: 1,
      };
    case 1:
      return {
        x: x,
        y: 1,
        z: -1,
      };
    case 2:
      return {
        x: x,
        y: -1,
        z: 1,
      };
    case 3:
      return {
        x: x,
        y: -1,
        z: -1,
      };
    case 4:
      return {
        x: 1,
        y: y,
        z: 1,
      };
    case 5:
      return {
        x: 1,
        y: y,
        z: -1,
      };
    case 6:
      return {
        x: -1,
        y: y,
        z: 1,
      };
    case 7:
      return {
        x: -1,
        y: y,
        z: -1,
      };
    case 8:
      return {
        x: 1,
        y: 1,
        z: z,
      };
    case 9:
      return {
        x: 1,
        y: -1,
        z: z,
      };
    case 10:
      return {
        x: -1,
        y: 1,
        z: z,
      };
    case 11:
      return {
        x: -1,
        y: -1,
        z: z,
      };
  }
}
