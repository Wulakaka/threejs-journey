import { Environment, Float, OrbitControls, useGLTF } from "@react-three/drei";

export default function Experience() {
  const computer = useGLTF(
    "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/macbook/model.gltf",
  );

  return (
    <>
      <color args={["#241a1a"]} attach="background" />

      <Environment files="the_sky_is_on_fire_2k.hdr" />

      <OrbitControls makeDefault />

      <Float rotationIntensity={0.4}>
        <primitive object={computer.scene} position-y={-1.2} />
      </Float>
    </>
  );
}
