import { OrbitControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import {
  EffectComposer,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { ToneMappingMode, BlendFunction } from "postprocessing";
import { useControls } from "leva";
import { useEffect, useState } from "react";

export default function Experience() {
  const { blendFunctionKey } = useControls("postprocessing", {
    blendFunctionKey: {
      options: Object.keys(BlendFunction),
    },
  });

  const [blendFunction, setBlendFunction] = useState(BlendFunction.NORMAL);
  useEffect(() => {
    setBlendFunction(BlendFunction[blendFunctionKey]);
  }, [blendFunctionKey]);

  return (
    <>
      <color args={["#FFFFFF"]} attach="background" />

      <EffectComposer multisampling={4}>
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Vignette offset={0.3} darkness={0.9} blendFunction={blendFunction} />
      </EffectComposer>

      <Perf position="top-left" />

      <OrbitControls makeDefault />

      <directionalLight castShadow position={[1, 2, 3]} intensity={4.5} />
      <ambientLight intensity={1.5} />

      <mesh castShadow position-x={-2}>
        <sphereGeometry />
        <meshStandardMaterial color="orange" />
      </mesh>

      <mesh castShadow position-x={2} scale={1.5}>
        <boxGeometry />
        <meshStandardMaterial color="mediumpurple" />
      </mesh>

      <mesh
        receiveShadow
        position-y={-1}
        rotation-x={-Math.PI * 0.5}
        scale={10}
      >
        <planeGeometry />
        <meshStandardMaterial color="greenyellow" />
      </mesh>
    </>
  );
}
