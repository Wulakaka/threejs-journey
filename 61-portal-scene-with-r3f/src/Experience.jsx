import { OrbitControls, useGLTF } from "@react-three/drei";

export default function Experience() {
  const model = useGLTF("./model/portal.glb");

  console.log(model);

  return (
    <>
      <color args={["#030202"]} attach="background" />

      <OrbitControls makeDefault />

      <mesh scale={1.5}>
        <boxGeometry />
        <meshNormalMaterial />
      </mesh>
    </>
  );
}
