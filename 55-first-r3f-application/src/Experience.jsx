import { useFrame, extend, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { OrbitControls } from "three/addons";

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
      <group ref={group}>
        <mesh ref={cube} rotation-y={Math.PI * 0.25} position-x={2} scale={1.5}>
          <boxGeometry />
          <meshBasicMaterial color="mediumpurple" />
        </mesh>
        <mesh position-x={-2}>
          <sphereGeometry />
          <meshBasicMaterial color="orange" />
        </mesh>
      </group>
      <mesh rotation-x={-Math.PI * 0.5} position-y={-1} scale={10}>
        <planeGeometry />
        <meshBasicMaterial color="greenyellow" />
      </mesh>
    </>
  );
}
