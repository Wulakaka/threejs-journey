import { useEffect, useMemo, useRef } from "react";
import { DoubleSide } from "three";

export default function CustomObject() {
  const verticesCount = 10 * 3;
  const positions = useMemo(() => {
    const positions = new Float32Array(verticesCount * 3);
    for (let i = 0; i < verticesCount * 3; i++)
      positions[i] = (Math.random() - 0.5) * 3;
    return positions;
  }, []);
  const geometry = useRef();

  useEffect(() => {
    geometry.current.computeVertexNormals();
  }, [positions]);

  return (
    <mesh>
      <bufferGeometry ref={geometry}>
        <bufferAttribute
          attach="attributes-position"
          count={verticesCount}
          itemSize={3}
          array={positions}
        ></bufferAttribute>
      </bufferGeometry>
      <meshStandardMaterial
        color="red"
        side={DoubleSide}
      ></meshStandardMaterial>
    </mesh>
  );
}
