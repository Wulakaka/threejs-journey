import { useLoader } from "@react-three/fiber";
import { DRACOLoader, GLTFLoader } from "three/addons";

export default function Model() {
  const model = useLoader(
    GLTFLoader,
    "./FlightHelmet/glTF/FlightHelmet.gltf",
    (loader) => {
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath("./draco/");
      loader.setDRACOLoader(dracoLoader);
    },
  );

  return <primitive object={model.scene} scale={5} position-y={-1} />;
}
