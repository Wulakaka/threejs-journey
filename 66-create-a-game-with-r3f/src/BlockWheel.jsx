import { RigidBody } from "@react-three/rapier";
import { useMemo } from "react";

export default function BlockWheel({
  position = [0, 0, 0],
  material,
  boxGeometry,
}) {
  const horizonCount = 4;
  const fromTransitions = useMemo(() => {
    return Array(horizonCount)
      .fill(null)
      .map((_, index) => {
        const theta = ((index + 0.5) / horizonCount) * Math.PI - Math.PI / 2;
        const length = 4 - (Math.sin(theta) + 1);
        const x = -2 + length / 2;
        const y = -0.1;
        const z = 2 - ((index + 0.5) / horizonCount) * 2;
        return {
          position: [x, y, z],
          scale: [length, 0.2, 0.4],
        };
      });
  }, [horizonCount]);

  const toPositions = useMemo(() => {
    return Array(horizonCount)
      .fill(null)
      .map((_, index) => {
        const theta = ((index + 0.5) / horizonCount) * Math.PI - Math.PI / 2;
        const length = 2 + (Math.sin(theta) + 1);
        const x = 2 - length / 2;
        const y = -0.1;
        const z = -((index + 0.5) / horizonCount) * 2;
        return {
          position: [x, y, z],
          scale: [length, 0.2, 0.4],
        };
      });
  }, [horizonCount]);

  const count = 24;
  const translations = useMemo(() => {
    const radius = 1.2;
    return Array(count)
      .fill(null)
      .map((_, index) => {
        const theta = ((index + 0.5) / count) * Math.PI * 2;
        const x = (theta / (Math.PI * 2)) * 2 - 1;
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
        {fromTransitions.map(({ position, scale }, key) => (
          <mesh
            material={material}
            geometry={boxGeometry}
            scale={scale}
            position={position}
            key={key + "from"}
          ></mesh>
        ))}
        {toPositions.map(({ position, scale }, key) => (
          <mesh
            material={material}
            geometry={boxGeometry}
            scale={scale}
            position={position}
            key={key + "to"}
          ></mesh>
        ))}
        {translations.map(({ position, rotation }, key) => (
          <mesh
            material={material}
            geometry={boxGeometry}
            scale={[2, 0.2, 0.3]}
            position={position}
            rotation={rotation}
            key={key}
          ></mesh>
        ))}
      </RigidBody>
    </group>
  );
}
