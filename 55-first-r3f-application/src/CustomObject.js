import { useEffect, useRef } from "react";

export default function CustomObject() {
  const verticesCount = 10 * 3;
  const positions = new Float32Array(verticesCount * 3);
  for (let i = 0; i < verticesCount * 3; i++)
    positions[i] = (Math.random() - 0.5) * 3;

  const geometry = useRef();
  console.log(geometry.current);
  useEffect(() => {
    console.log(geometry.current);
  }, []);
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
      <meshBasicMaterial color="red"></meshBasicMaterial>
    </mesh>
  );
}
