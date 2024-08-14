import {
  Environment,
  Float,
  PresentationControls,
  useGLTF,
} from "@react-three/drei";

export default function Experience() {
  const computer = useGLTF(
    "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/macbook/model.gltf",
  );

  return (
    <>
      <color args={["#241a1a"]} attach="background" />

      <Environment files="the_sky_is_on_fire_2k.hdr" />

      <PresentationControls
        global
        rotation={[0.13, 0.1, 0]}
        polar={[-0.4, 0.2]}
        azimuth={[-1, 0.75]}
      >
        <Float rotationIntensity={0.4}>
          <primitive object={computer.scene} position-y={-1.2} />
        </Float>
      </PresentationControls>
    </>
  );
}
