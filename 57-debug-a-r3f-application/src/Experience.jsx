import { OrbitControls } from "@react-three/drei";
import { button, useControls } from "leva";

export default function Experience() {
  const { position, color, visible } = useControls("sphere", {
    position: {
      value: {
        x: -2,
        y: 0,
      },
      min: -4,
      max: 4,
      step: 0.01,
      joystick: "invertY",
    },
    color: "orange",
    visible: true,
    myInterval: {
      min: 0,
      max: 10,
      value: [4, 5],
    },
    clickMe: button(() => console.log("ok")),
    choice: { options: ["a", "b", "c"] },
  });

  return (
    <>
      <OrbitControls makeDefault />

      <directionalLight position={[1, 2, 3]} intensity={4.5} />
      <ambientLight intensity={1.5} />

      <mesh position={[position.x, position.y, 0]} visible={visible}>
        <sphereGeometry />
        <meshStandardMaterial color={color} />
      </mesh>

      <mesh position-x={2} scale={1.5}>
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
