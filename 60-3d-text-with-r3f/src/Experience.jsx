import {
  Center,
  OrbitControls,
  Text3D,
  useMatcapTexture,
  useTexture,
} from "@react-three/drei";
import { Perf } from "r3f-perf";

export default function Experience() {
  // const [matcapTexture] = useMatcapTexture("./textures/matcaps/1.png", 256);
  const matcapTexture = useTexture("./textures/matcaps/3.png");

  const donutArray = [...Array(100)];

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
          <meshMatcapMaterial matcap={matcapTexture} />
        </Text3D>
      </Center>

      {donutArray.map((value, index) => (
        <mesh
          position={[
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
          ]}
          scale={Math.random() * 0.2 + 0.2}
          rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
        >
          <torusGeometry />
          <meshMatcapMaterial matcap={matcapTexture} />
        </mesh>
      ))}
    </>
  );
}
