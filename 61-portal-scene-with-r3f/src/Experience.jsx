import {
  Center,
  OrbitControls,
  Sparkles,
  useGLTF,
  useTexture,
  shaderMaterial,
} from "@react-three/drei";
import { extend } from "@react-three/fiber";
import portalVertexShader from "./shaders/portal/vertex.glsl";
import portalFragmentShader from "./shaders/portal/fragment.glsl";
import * as THREE from "three";

useGLTF.setDecoderPath("./draco/");

export default function Experience() {
  const { nodes } = useGLTF("./model/portal.glb");
  const bakedTexture = useTexture("./model/baked.jpg");
  bakedTexture.flipY = false;

  const PortalMaterial = shaderMaterial(
    {
      uTime: 0,
      uColorStart: new THREE.Color("#000000"),
      uColorEnd: new THREE.Color("#ffffff"),
    },
    portalVertexShader,
    portalFragmentShader,
  );

  extend({ PortalMaterial });

  return (
    <>
      <color args={["#030202"]} attach="background" />

      <OrbitControls makeDefault />

      <Center>
        <mesh geometry={nodes.baked.geometry} position={nodes.baked.position}>
          <meshBasicMaterial map={bakedTexture} />
        </mesh>
        <mesh
          geometry={nodes.poleLightA.geometry}
          position={nodes.poleLightA.position}
        >
          <meshBasicMaterial color="#fffffb" />
        </mesh>
        <mesh
          geometry={nodes.poleLightB.geometry}
          position={nodes.poleLightB.position}
          rotation={nodes.poleLightB.rotation}
        >
          <meshBasicMaterial color="#fffffb" />
        </mesh>
        <mesh
          geometry={nodes.portalLight.geometry}
          position={nodes.portalLight.position}
          rotation={nodes.portalLight.rotation}
        >
          <portalMaterial />
        </mesh>
        <Sparkles
          size={6}
          scale={[4, 2, 4]}
          position-y={1}
          count={40}
          speed={0.2}
        />
      </Center>
    </>
  );
}
