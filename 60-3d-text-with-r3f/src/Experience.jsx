import {
  Center,
  OrbitControls,
  Text3D,
  useMatcapTexture,
  useTexture,
} from "@react-three/drei";
import { Perf } from "r3f-perf";
import { useEffect, useState } from "react";
import * as THREE from "three";

const torusGeometry = new THREE.TorusGeometry();
const material = new THREE.MeshMatcapMaterial();

export default function Experience() {
  // const [torusGeometry, setTorusGeometry] = useState();
  // const [material, setMaterial] = useState();

  useEffect(() => {
    // matcapTexture.colorSpace 已经是 srgb 了，不需要再设置
    // matcapTexture.colorSpace = THREE.SRGBColorSpace;
    // matcapTexture.needsUpdate = true;

    material.matcap = matcapTexture;
    material.needsUpdate = true;
  }, []);

  // const [matcapTexture] = useMatcapTexture("7B5254_E9DCC7_B19986_C8AC91", 256);
  const matcapTexture = useTexture("./textures/matcaps/3.png");

  const donutArray = [...Array(100)];

  return (
    <>
      <Perf position="top-left" />

      <OrbitControls makeDefault />

      {/*<torusGeometry ref={setTorusGeometry} />*/}
      {/*<meshMatcapMaterial ref={setMaterial} matcap={matcapTexture} />*/}

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
