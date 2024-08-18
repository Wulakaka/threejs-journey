import { Center, OrbitControls, useGLTF } from "@react-three/drei";
import { Perf } from "r3f-perf";
import {
  BallCollider,
  CuboidCollider,
  CylinderCollider,
  InstancedRigidBodies,
  Physics,
  RigidBody,
} from "@react-three/rapier";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Experience() {
  const [hitSound] = useState(() => new Audio("./hit.mp3"));

  const cube = useRef();

  const cubeJump = (e) => {
    // 类似于射击效果
    // cube.current.applyImpulseAtPoint(
    //   e.ray.direction.multiplyScalar(5),
    //   e.point,
    //   true,
    // );

    const mass = cube.current.mass();

    cube.current.applyImpulse({
      x: 0,
      y: 5 * mass,
      z: 0,
    });

    cube.current.applyTorqueImpulse({
      x: Math.random() - 0.5,
      y: Math.random() - 0.5,
      z: Math.random() - 0.5,
    });
  };

  const ball = useRef();

  const jumpBall = (e) => {
    const mass = ball.current.mass();
    ball.current.applyImpulseAtPoint(
      {
        x: 0,
        y: 10 * mass,
        z: 0,
      },
      e.point,
      true,
    );
  };

  const twister = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    const eulerRotation = new THREE.Euler(0, time * 3, 0);
    const quaternionRotation = new THREE.Quaternion();
    quaternionRotation.setFromEuler(eulerRotation);
    twister.current?.setNextKinematicRotation(quaternionRotation);

    const angle = time * 0.5;
    const x = Math.cos(angle) * 2;
    const z = Math.sin(angle) * 2;
    twister.current?.setNextKinematicTranslation({ x, y: -0.8, z });
  });

  const collisionEnter = (e) => {
    console.log("collision!");
    // hitSound.currentTime = 0;
    // hitSound.volume = Math.random();
    // hitSound.play();
  };

  const hamburger = useGLTF("./hamburger.glb");

  const cubesCount = 100;
  const instances = useMemo(() => {
    const instances = [];
    for (let i = 0; i < cubesCount; i++) {
      const scale = Math.random() * 0.09 + 0.01;
      instances.push({
        key: `instance_${i}`,
        position: [
          (Math.random() - 0.5) * 8,
          6 + i * 2,
          (Math.random() - 0.5) * 8,
        ],
        rotation: [Math.random(), Math.random(), Math.random()],
        scale: [scale, scale, scale],
      });
    }

    return instances;
  }, []);

  // const cubes = useRef();
  //
  // useEffect(() => {
  //   for (let i = 0; i < cubesCount; i++) {
  //     const matrix = new THREE.Matrix4();
  //     matrix.compose(
  //       new THREE.Vector3(i * 2, 0, 0),
  //       new THREE.Quaternion(),
  //       new THREE.Vector3(1, 1, 1),
  //     );
  //     cubes.current.setMatrixAt(i, matrix);
  //   }
  // }, []);

  const heartShape = useMemo(() => {
    const x = 0,
      y = 0;

    const heartShape = new THREE.Shape();

    heartShape.moveTo(x + 5, y + 5);
    heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
    heartShape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
    heartShape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
    heartShape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
    heartShape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
    heartShape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);

    return heartShape;
  }, []);

  const extrudeSettings = {
    depth: 3,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 2,
    bevelSize: 3,
    bevelThickness: 3,
  };

  return (
    <>
      <Perf position="top-left" />

      <OrbitControls makeDefault />

      <directionalLight castShadow position={[1, 2, 3]} intensity={4.5} />
      <ambientLight intensity={1.5} />

      <Physics debug={false} gravity={[0, -9.81, 0]}>
        <RigidBody
          ref={ball}
          colliders="ball"
          position={[-1.5, 2, 0]}
          restitution={1}
        >
          <mesh castShadow onClick={jumpBall}>
            <sphereGeometry />
            <meshStandardMaterial color="orange" />
          </mesh>
        </RigidBody>

        <RigidBody
          ref={cube}
          position={[1.5, 2, 0]}
          gravityScale={1}
          restitution={0}
          friction={0.7}
          colliders={false}
          // onCollisionEnter={collisionEnter}
          // onCollisionExit={() => console.log("exit!")}
          // onSleep={() => console.log("sleep")}
          // onWake={() => console.log("wake")}
        >
          <CuboidCollider mass={2} args={[0.5, 0.5, 0.5]} />
          <mesh castShadow onClick={cubeJump}>
            <boxGeometry />
            <meshStandardMaterial color="mediumpurple" />
          </mesh>
        </RigidBody>

        <RigidBody type="fixed" restitution={0} friction={0.7}>
          <mesh receiveShadow position-y={-1.25}>
            <boxGeometry args={[10, 0.5, 10]} />
            <meshStandardMaterial color="greenyellow" />
          </mesh>
        </RigidBody>

        <Center position-y={-4} scale={[1, 0.5, 1]}>
          <RigidBody type="fixed" rotation-x={-Math.PI / 2} colliders="trimesh">
            <mesh receiveShadow>
              <extrudeGeometry args={[heartShape, extrudeSettings]} />
              <meshStandardMaterial color="purple" />
            </mesh>
          </RigidBody>
        </Center>

        <RigidBody
          ref={twister}
          position={[0, -0.8, 0]}
          friction={0}
          type="kinematicPosition"
        >
          <mesh castShadow scale={[0.4, 0.4, 3]}>
            <boxGeometry />
            <meshStandardMaterial color="red" />
          </mesh>
        </RigidBody>

        <RigidBody position={[0, 4, 0]} colliders={false}>
          <CylinderCollider args={[0.5, 1.25]} />
          <primitive object={hamburger.scene} scale={0.25} />
        </RigidBody>

        <RigidBody type="fixed">
          <CuboidCollider args={[5, 2, 0.5]} position={[0, 1, 5.5]} />
          <CuboidCollider args={[5, 2, 0.5]} position={[0, 1, -5.5]} />
          <CuboidCollider args={[0.5, 2, 5]} position={[5.5, 1, 0]} />
          <CuboidCollider args={[0.5, 2, 5]} position={[-5.5, 1, 0]} />
        </RigidBody>

        <InstancedRigidBodies
          instances={instances}
          restitution={0.5}
          colliders="cuboid"
        >
          <instancedMesh
            args={[null, null, cubesCount]}
            castShadow
            receiveShadow
          >
            <extrudeGeometry args={[heartShape, extrudeSettings]} />
            <meshStandardMaterial color="tomato" />
          </instancedMesh>
        </InstancedRigidBodies>
      </Physics>
    </>
  );
}
