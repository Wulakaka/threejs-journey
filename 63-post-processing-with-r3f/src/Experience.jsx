import { OrbitControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import {
  EffectComposer,
  Glitch,
  Noise,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { ToneMappingMode, BlendFunction, GlitchMode } from "postprocessing";
import { useControls } from "leva";
import { useEffect, useState } from "react";

console.log(GlitchMode);

export default function Experience() {
  const { blendFunctionKey } = useControls("postprocessing", {
    blendFunctionKey: {
      options: Object.keys(BlendFunction),
      value: "OVERLAY",
    },
  });

  const [blendFunction, setBlendFunction] = useState(BlendFunction.OVERLAY);
  useEffect(() => {
    setBlendFunction(BlendFunction[blendFunctionKey]);
  }, [blendFunctionKey]);

  return (
    <>
      <color args={["#FFFFFF"]} attach="background" />

      <EffectComposer multisampling={4}>
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        {/*        <Vignette
          offset={0.3}
          darkness={0.9}
          blendFunction={BlendFunction.NORMAL}
        />*/}
        {/*<Glitch
          delay={[0.5, 1]}
          duration={[0.1, 0.3]}
          strength={[0.2, 0.4]}
          mode={GlitchMode.CONSTANT_MILD}
        />*/}
        <Noise premultiply blendFunction={blendFunction} />
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
