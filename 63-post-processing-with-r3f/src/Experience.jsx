import { OrbitControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  Glitch,
  Noise,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { ToneMappingMode, BlendFunction, GlitchMode } from "postprocessing";
import { useControls } from "leva";
import { useEffect, useRef, useState } from "react";
import Drunk from "./Drunk.jsx";

export default function Experience() {
  // const { blendFunctionKey, focusDistance, focalLength } = useControls(
  //   "postprocessing",
  //   {
  //     blendFunctionKey: {
  //       options: Object.keys(BlendFunction),
  //       value: "OVERLAY",
  //     },
  //     focusDistance: {
  //       value: 0.025,
  //       min: 0,
  //       max: 1,
  //       step: 0.001,
  //     },
  //     focalLength: {
  //       value: 0.025,
  //       min: 0,
  //       max: 1,
  //       step: 0.001,
  //     },
  //   },
  // );
  //
  // const [blendFunction, setBlendFunction] = useState(BlendFunction.OVERLAY);
  // useEffect(() => {
  //   setBlendFunction(BlendFunction[blendFunctionKey]);
  // }, [blendFunctionKey]);

  const drunkRef = useRef();

  const drunkProps = useControls("Drunk Effect", {
    frequency: { value: 2, min: 1, max: 20 },
    amplitude: { value: 0.1, min: 0, max: 1 },
  });

  return (
    <>
      <color args={["#ffffff"]} attach="background" />

      <EffectComposer multisampling={4}>
        {/* <Vignette
          offset={0.3}
          darkness={0.9}
          blendFunction={BlendFunction.NORMAL}
        />
        <Glitch
          delay={[0.5, 1]}
          duration={[0.1, 0.3]}
          strength={[0.2, 0.4]}
          mode={GlitchMode.CONSTANT_MILD}
        />
        <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} />
        <Bloom mipmapBlur intensity={0.5} luminanceThreshold={0} />
        <DepthOfField
          focusDistance={0.025}
          focalLength={0.025}
          bokehScale={6}
        />*/}
        <Drunk
          ref={drunkRef}
          {...drunkProps}
          blendFunction={BlendFunction.DARKEN}
        />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
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
