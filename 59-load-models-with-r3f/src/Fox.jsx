import { useGLTF } from "@react-three/drei";

export default function Fox() {
  const fox = useGLTF("./Fox/glTF/Fox.gltf");

  return (
    <primitive
      object={fox.scene}
      position={[-2.5, 0, 2.5]}
      scale={0.02}
      rotation-y={0.3}
    ></primitive>
  );
}
