import { useFrame, extend, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { OrbitControls } from "three/addons";
import CustomObject from "./CustomObject.js";

extend({ OrbitControls });
export default function Experience() {
  const { camera, gl } = useThree();

  const cube = useRef();
  const group = useRef();
  useFrame((state, delta) => {
    cube.current.rotation.y += delta;
    // group.current.rotation.y += delta;
  });

  return (
    <>
      <orbitControls args={[camera, gl.domElement]} />

      <directionalLight intensity={4.5} position={[1, 2, 3]} />
      <ambientLight intensity={1.5} />

      <group ref={group}>
        <mesh ref={cube} rotation-y={Math.PI * 0.25} position-x={2} scale={1.5}>
          <boxGeometry />
          <meshStandardMaterial color="mediumpurple" />
        </mesh>
        <mesh position-x={-2}>
          <sphereGeometry />
          <meshStandardMaterial color="orange" />
        </mesh>
      </group>
      <mesh rotation-x={-Math.PI * 0.5} position-y={-1} scale={10}>
        <planeGeometry />
        <meshStandardMaterial color="greenyellow" />
      </mesh>

      <CustomObject />
    </>
  );
}
