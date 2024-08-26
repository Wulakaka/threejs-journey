import { RigidBody } from "@react-three/rapier";
import { useMemo } from "react";

export default function BlockWheel({
  position = [0, 0, 0],
  material,
  boxGeometry,
}) {
  const horizonCount = 8;
  const fromPositions = useMemo(() => {
    return Array(horizonCount)
      .fill(null)
      .map((_, index) => {
        const theta = ((index + 0.5) / horizonCount) * Math.PI - Math.PI / 2;
        const x = -(Math.sin(theta) + 1);
        const y = -0.1;
        const z = 2 - ((index + 0.5) / horizonCount) * 2;
        return [x, y, z];
      });
  }, [horizonCount]);

  const toPositions = useMemo(() => {
    return Array(horizonCount)
      .fill(null)
      .map((_, index) => {
        const theta =
          (((index + 0.5) / horizonCount) * Math.PI) / 2 - Math.PI / 2;
        const x = -(Math.sin(theta) + 1) * 2 + 2;
        const y = -0.1;
        const z = -((index + 0.5) / horizonCount) * 2;
        return [x, y, z];
      });
  }, [horizonCount]);

  const count = 24;
  const translations = useMemo(() => {
    const radius = 2;
    return Array(count)
      .fill(null)
      .map((_, index) => {
        const theta = ((index + 0.5) / count) * Math.PI * 2;
        const x = (theta / (Math.PI * 2)) * 4 - 2;
        const y = Math.cos(theta + Math.PI) * (radius + 0.1) + radius;
        const z = Math.sin(theta + Math.PI) * (radius + 0.1);
        return {
          position: [x, y, z],
          rotation: [theta, 0, 0],
        };
      });
  }, [count]);

  return (
    <group position={position}>
      <RigidBody type={"fixed"}>
        {fromPositions.map((position, key) => (
          <mesh
            material={material}
            geometry={boxGeometry}
            scale={[4, 0.2, 0.2]}
            position={position}
            key={key + "from"}
          ></mesh>
        ))}
        {toPositions.map((position, key) => (
          <mesh
            material={material}
            geometry={boxGeometry}
            scale={[4, 0.2, 0.2]}
            position={position}
            key={key + "to"}
          ></mesh>
        ))}
        {translations.map(({ position, rotation }, key) => (
          <mesh
            material={material}
            geometry={boxGeometry}
            scale={[4, 0.2, 0.5]}
            position={position}
            rotation={rotation}
            key={key}
          ></mesh>
        ))}
      </RigidBody>
    </group>
  );
}
