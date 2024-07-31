import { Center, OrbitControls, Text3D } from "@react-three/drei";
import { Perf } from "r3f-perf";

export default function Experience() {
  return (
    <>
      <Perf position="top-left" />

      <OrbitControls makeDefault />

      <Center>
        <Text3D
          font="./fonts/helvetiker_regular.typeface.json"
          size={0.75}
          height={0.2}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
        >
          Hello, world!
          <meshNormalMaterial />
        </Text3D>
      </Center>
    </>
  );
}
