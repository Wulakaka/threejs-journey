import { RigidBody, useRapier } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import useGame from "./stores/useGame.jsx";

export default function Player({
  position = [0, 1, 0],
  camera,
  player = "player1",
  color = "mediumpurple",
}) {
  const body = useRef();
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const { rapier, world } = useRapier();
  // 设置初始 camera 位置
  const [smoothedCameraPosition] = useState(
    () => new THREE.Vector3(10, 10, 10),
  );
  const [smoothedCameraTarget] = useState(() => new THREE.Vector3());

  const jump = () => {
    const origin = body.current.translation();
    origin.y -= 0.31;
    const direction = { x: 0, y: -1, z: 0 };
    const ray = new rapier.Ray(origin, direction);
    const hit = world.castRay(ray, 10, true);

    if (hit && hit.timeOfImpact < 0.15) {
      body.current.applyImpulse({ x: 0, y: 0.7, z: 0 });
    }
  };

  const reset = () => {
    body.current.setTranslation({
      x: position[0],
      y: position[1],
      z: position[2],
    });
    // https://rapier.rs/javascript3d/classes/RigidBody.html#setLinvel
    // 线速度
    body.current.setLinvel({ x: 0, y: 0, z: 0 });
    // https://rapier.rs/javascript3d/classes/RigidBody.html#setAngvel
    // 角速度
    body.current.setAngvel({ x: 0, y: 0, z: 0 });
  };

  const start = useGame((state) => state.start);
  const end = useGame((state) => state.end);
  const restart = useGame((state) => state.restart);
  const blocksCount = useGame((state) => state.blocksCount);

  useEffect(() => {
    const unsubscribeReset = useGame.subscribe(
      (state) => state[player].phase,
      (value) => {
        if (value === "ready") {
          reset(player);
        }
      },
    );

    const unsubscribeJump = subscribeKeys(
      (state) => state[`${player}jump`],
      (value) => {
        if (value) {
          jump();
        }
      },
    );

    const unsubscribeAny = subscribeKeys(
      (state) => {
        return (
          state[`${player}forward`] ||
          state[`${player}backward`] ||
          state[`${player}leftward`] ||
          state[`${player}rightward`] ||
          state[`${player}jump`]
        );
      },
      () => {
        start(player);
      },
    );

    return () => {
      unsubscribeReset();
      unsubscribeJump();
      unsubscribeAny();
    };
  }, []);

  useFrame((state, delta) => {
    if (!body.current) return;

    /**
     * Controls
     */
    const {
      [`${player}forward`]: forward,
      [`${player}backward`]: backward,
      [`${player}leftward`]: leftward,
      [`${player}rightward`]: rightward,
    } = getKeys();
    const impulse = { x: 0, y: 0, z: 0 };
    const torque = { x: 0, y: 0, z: 0 };

    const impulseStrength = 0.6 * delta;
    const torqueStrength = 0.2 * delta;

    if (forward) {
      impulse.z -= impulseStrength;
      torque.x -= torqueStrength;
    }

    if (rightward) {
      impulse.x += impulseStrength;
      torque.z -= torqueStrength;
    }

    if (backward) {
      impulse.z += impulseStrength;
      torque.x += torqueStrength;
    }

    if (leftward) {
      impulse.x -= impulseStrength;
      torque.z += torqueStrength;
    }

    body.current.applyImpulse(impulse);
    body.current.applyTorqueImpulse(torque);

    /**
     * Camera
     */
    const bodyPosition = body.current.translation();
    const cameraPosition = new THREE.Vector3();
    cameraPosition.copy(bodyPosition);
    cameraPosition.z += 2.25;
    cameraPosition.y += 0.65;

    const cameraTarget = new THREE.Vector3();
    cameraTarget.copy(bodyPosition);
    cameraTarget.y += 0.25;

    smoothedCameraPosition.lerp(cameraPosition, 5 * delta);
    smoothedCameraTarget.lerp(cameraTarget, 5 * delta);

    camera.position.copy(smoothedCameraPosition);
    camera.lookAt(smoothedCameraTarget);

    /**
     * Phases
     */
    if (bodyPosition.z < -(blocksCount * 4 + 2)) end(player);
    if (bodyPosition.y < -4) restart(player);
  });

  return (
    <RigidBody
      ref={body}
      canSleep={false}
      colliders="ball"
      restitution={0.2}
      friction={1}
      linearDamping={0.5}
      angularDamping={0.5}
      position={position}
    >
      <mesh castShadow>
        <icosahedronGeometry args={[0.3, 1]} />
        <meshStandardMaterial flatShading color={color} />
      </mesh>
    </RigidBody>
  );
}
