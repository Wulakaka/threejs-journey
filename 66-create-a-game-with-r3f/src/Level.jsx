import * as THREE from "three";
import { RigidBody } from "@react-three/rapier";
import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Text, useGLTF } from "@react-three/drei";
import Bounds from "./Bounds.jsx";
import BlockWheel from "./BlockWheel.jsx";

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

const floor1Material = new THREE.MeshStandardMaterial({ color: "limegreen" });
const floor2Material = new THREE.MeshStandardMaterial({ color: "greenyellow" });
const obstacleMaterial = new THREE.MeshStandardMaterial({ color: "orangered" });
const wallMaterial = new THREE.MeshStandardMaterial({ color: "slategrey" });

export function BlockStart({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <Float floatIntensity={0.25} rotationIntensity={0.25}>
        <Text
          font="./bebas-neue-v9-latin-regular.woff"
          scale={0.5}
          maxWidth={0.25}
          lineHeight={0.75}
          textAlign="right"
          position={[0.75, 0.65, 0]}
          rotation-y={-0.25}
        >
          Marble Race
          <meshBasicMaterial toneMapped={false} />
        </Text>
      </Float>
      <mesh
        geometry={boxGeometry}
        material={floor1Material}
        position={[0, -0.1, 0]}
        scale={[4, 0.2, 4]}
        receiveShadow={true}
      ></mesh>
    </group>
  );
}

export function BlockEnd({ position = [0, 0, 0] }) {
  const hamburger = useGLTF("./hamburger.glb");
  // 为了让阴影生效，需要给每个 mesh 设置 castShadow 为 true
  hamburger.scene.children.forEach((mesh) => {
    mesh.castShadow = true;
  });

  return (
    <group position={position}>
      <Text
        font="./bebas-neue-v9-latin-regular.woff"
        scale={1}
        position={[0, 2.25, 2]}
      >
        FINISH
        <meshBasicMaterial toneMapped={false} />
      </Text>
      <mesh
        geometry={boxGeometry}
        material={floor1Material}
        position={[0, 0, 0]}
        scale={[4, 0.2, 4]}
        receiveShadow={true}
      ></mesh>
      <RigidBody
        type="fixed"
        colliders="hull"
        position={[0, 0.25, 0]}
        restitution={0.2}
        friction={0}
      >
        <primitive object={hamburger.scene} scale={0.2} />
      </RigidBody>
    </group>
  );
}

export function BlockSpinner({ position = [0, 0, 0] }) {
  const obstacle = useRef();
  // 用 useState 来缓存 speed 的值，避免每次渲染都重新生成一个随机数
  const [speed] = useState(
    () => (Math.random() + 0.2) * (Math.random() > 0.5 ? 1 : -1),
  );

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const rotation = new THREE.Quaternion();
    rotation.setFromEuler(new THREE.Euler(0, time * speed, 0));
    // https://rapier.rs/javascript3d/classes/RigidBody.html#setNextKinematicRotation
    obstacle.current?.setNextKinematicRotation(rotation);
  });

  return (
    <group position={position}>
      <mesh
        geometry={boxGeometry}
        material={floor2Material}
        position={[0, -0.1, 0]}
        scale={[4, 0.2, 4]}
        receiveShadow={true}
      ></mesh>

      <RigidBody
        type="kinematicPosition"
        ref={obstacle}
        position={[0, 0.3, 0]}
        restitution={0.2}
        friction={0}
      >
        <mesh
          geometry={boxGeometry}
          scale={[3.5, 0.3, 0.3]}
          material={obstacleMaterial}
          castShadow={true}
          receiveShadow={true}
        />
      </RigidBody>
    </group>
  );
}

export function BlockLimbo({ position = [0, 0, 0] }) {
  const obstacle = useRef();
  const [timeOffset] = useState(() => Math.random() * Math.PI * 2);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const y = Math.sin(time + timeOffset) + 1.15;
    // https://rapier.rs/javascript3d/classes/RigidBody.html#setNextKinematicTranslation
    obstacle.current?.setNextKinematicTranslation({
      x: position[0],
      y: position[1] + y,
      z: position[2],
    });
  });

  return (
    <group position={position}>
      <mesh
        geometry={boxGeometry}
        material={floor2Material}
        position={[0, -0.1, 0]}
        scale={[4, 0.2, 4]}
        receiveShadow={true}
      ></mesh>

      <RigidBody
        type="kinematicPosition"
        ref={obstacle}
        position={[0, 0.3, 0]}
        restitution={0.2}
        friction={0}
      >
        <mesh
          geometry={boxGeometry}
          scale={[3.5, 0.3, 0.3]}
          material={obstacleMaterial}
          castShadow={true}
          receiveShadow={true}
        />
      </RigidBody>
    </group>
  );
}

export function BlockAxe({ position = [0, 0, 0] }) {
  const obstacle = useRef();
  const [timeOffset] = useState(() => Math.random() * Math.PI * 2);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const x = Math.sin(time + timeOffset) * 1.25;
    // https://rapier.rs/javascript3d/classes/RigidBody.html#setNextKinematicTranslation
    obstacle.current?.setNextKinematicTranslation({
      x: position[0] + x,
      y: position[1] + 0.75,
      z: position[2],
    });
  });

  return (
    <group position={position}>
      <mesh
        geometry={boxGeometry}
        material={floor2Material}
        position={[0, -0.1, 0]}
        scale={[4, 0.2, 4]}
        receiveShadow={true}
      ></mesh>

      <RigidBody
        type="kinematicPosition"
        ref={obstacle}
        position={[0, 0.3, 0]}
        restitution={0.2}
        friction={0}
      >
        <mesh
          geometry={boxGeometry}
          scale={[1.5, 1.5, 0.3]}
          material={obstacleMaterial}
          castShadow={true}
          receiveShadow={true}
        />
      </RigidBody>
    </group>
  );
}

export function Level({
  count = 5,
  types = [BlockSpinner, BlockLimbo, BlockAxe, BlockWheel],
  seed = 0,
}) {
  const blocks = useMemo(() => {
    const blocks = [];

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      blocks.push(type);
    }

    return blocks;
  }, [count, types, seed]);

  return (
    <>
      <BlockStart position={[0, 0, 0]} />
      {blocks.map((Block, index) => (
        <Block
          key={index}
          position={[0, 0, -4 * (index + 1)]}
          material={floor2Material}
          boxGeometry={boxGeometry}
        />
      ))}
      <BlockEnd position={[0, 0, -4 * (count + 1)]} />
      <Bounds
        length={count + 2}
        boxGeometry={boxGeometry}
        wallMaterial={wallMaterial}
      />
    </>
  );
}
