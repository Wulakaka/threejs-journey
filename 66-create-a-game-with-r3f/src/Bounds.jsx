import { CuboidCollider, RigidBody } from "@react-three/rapier";

export default function Bounds({ length = 1, boxGeometry, wallMaterial }) {
  return (
    <>
      <RigidBody type={"fixed"} restitution={0.2} friction={0}>
        <mesh
          geometry={boxGeometry}
          material={wallMaterial}
          scale={[0.3, 1.5, length * 4]}
          position={[2.15, 0.75, -length * 2 + 2]}
          castShadow
        ></mesh>
        <mesh
          geometry={boxGeometry}
          material={wallMaterial}
          scale={[0.3, 1.5, length * 4]}
          position={[-2.15, 0.75, -length * 2 + 2]}
          receiveShadow
        ></mesh>
        <mesh
          geometry={boxGeometry}
          material={wallMaterial}
          scale={[4, 1.5, 0.3]}
          position={[0, 0.75, -length * 4 + 2]}
          receiveShadow
        ></mesh>
        <CuboidCollider
          args={[2, 0.1, length * 2]}
          position={[0, -0.1, -length * 2 + 2]}
          restitution={0.2}
          friction={1}
        ></CuboidCollider>
      </RigidBody>
    </>
  );
}
