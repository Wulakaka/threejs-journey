import { useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Sky,
  ContactShadows,
  AccumulativeShadows,
  BakeShadows,
  OrbitControls,
  RandomizedLight,
  SoftShadows,
  useHelper,
} from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { Perf } from "r3f-perf";
import * as THREE from "three";
import { useControls } from "leva";

export default function Experience() {
  const cube = useRef();
  const directionalLight = useRef();

  useHelper(directionalLight, THREE.DirectionalLightHelper, 1);
  useFrame((state, delta) => {
    cube.current.rotation.y += delta * 0.2;
    // const time = state.clock.getElapsedTime();
    // cube.current.position.x = 2 + Math.sin(time);
  });

  const { color, opacity, blur } = useControls("contact shadows", {
    color: "#1d8f75",
    opacity: { value: 0.4, min: 0, max: 1 },
    blur: { value: 2.8, min: 0, max: 10 },
  });

  const [sunPosition, setPosition] = useState(new THREE.Vector3());

  const { phi, theta } = useControls("sky", {
    phi: {
      value: 0,
      min: 0,
      max: Math.PI,
    },
    theta: {
      value: 0,
      min: 0,
      max: Math.PI * 2,
    },
  });

  useEffect(() => {
    const spherical = new THREE.Spherical(3, phi, theta);
    const position = new THREE.Vector3().setFromSpherical(spherical);
    setPosition(position);
  }, [phi, theta]);

  const { envMapIntensity } = useControls("environment map", {
    envMapIntensity: {
      value: 3.5,
      min: 0,
      max: 15,
    },
  });

  const scene = useThree((state) => state.scene);
  // 不加这行，第一帧不会生效
  scene.environmentIntensity = envMapIntensity;
  useEffect(() => {
    scene.environmentIntensity = envMapIntensity;
  }, [envMapIntensity]);

  return (
    <>
      <Environment background>
        <color args={["#000000"]} attach="background" />
        <mesh position-z={-5} scale={10}>
          <planeGeometry />
          <meshBasicMaterial color="red"></meshBasicMaterial>
        </mesh>
      </Environment>

      {/*<BakeShadows />*/}
      {/*<SoftShadows size={25} samples={10} focus={0} />*/}

      <Perf position="top-left" />

      <OrbitControls makeDefault />

      {/*<directionalLight
        ref={directionalLight}
        position={sunPosition}
        intensity={4.5}
        castShadow={true}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-top={5}
        shadow-camera-right={5}
        shadow-camera-bottom={-5}
        shadow-camera-left={-5}
        shadow-camera-near={1}
        shadow-camera-far={10}
      />*/}

      {/*<AccumulativeShadows
        position-y={-0.99}
        scale={10}
        color="#316d39"
        opacity={0.8}
        frames={100}
      >
        <RandomizedLight
          position={[1, 2, 3]}
          amount={8}
          radius={1}
          ambient={0.5}
          intensity={3.5}
          bias={0.001}
        />
      </AccumulativeShadows>*/}

      <ContactShadows
        position={[0, -0.99, 0]}
        scale={10}
        resolution={512}
        far={5}
        color={color}
        opacity={opacity}
        blur={blur}
        frames={1}
      ></ContactShadows>

      {/*<ambientLight intensity={1.5} />*/}

      {/*<Sky sunPosition={sunPosition} />*/}

      <mesh castShadow={true} position-x={-2}>
        <sphereGeometry />
        <meshStandardMaterial color="orange" />
      </mesh>

      <mesh castShadow={true} ref={cube} position-x={2} scale={1.5}>
        <boxGeometry />
        <meshStandardMaterial color="mediumpurple" />
      </mesh>

      <mesh position-y={-1} rotation-x={-Math.PI * 0.5} scale={10}>
        <planeGeometry />
        <meshStandardMaterial color="greenyellow" />
      </mesh>
    </>
  );
}
