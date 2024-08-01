import {
  Center,
  OrbitControls,
  Text3D,
  useMatcapTexture,
  useTexture,
} from "@react-three/drei";
import { Perf } from "r3f-perf";
import { useState } from "react";

export default function Experience() {
  const [torusGeometry, setTorusGeometry] = useState();
  const [material, setMaterial] = useState();

  // const [matcapTexture] = useMatcapTexture("7B5254_E9DCC7_B19986_C8AC91", 256);
  const matcapTexture = useTexture("./textures/matcaps/3.png");

  const donutArray = [...Array(100)];

  return (
    <>
      <Perf position="top-left" />

      <OrbitControls makeDefault />

      <torusGeometry ref={setTorusGeometry} />
      <meshMatcapMaterial ref={setMaterial} matcap={matcapTexture} />

      <Center>
        <Text3D
          material={material}
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
          key={index}
          geometry={torusGeometry}
          material={material}
          position={[
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
          ]}
          scale={Math.random() * 0.2 + 0.2}
          rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
        ></mesh>
      ))}
    </>
  );
}
