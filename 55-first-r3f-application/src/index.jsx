import "./style.css";
import ReactDOM from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import Experience from "./Experience.jsx";
import {
  ACESFilmicToneMapping,
  LinearSRGBColorSpace,
  SRGBColorSpace,
} from "three";

const root = ReactDOM.createRoot(document.querySelector("#root"));

root.render(
  <>
    <Canvas
      gl={{
        antialias: true,
        toneMapping: ACESFilmicToneMapping,
        outputColorSpace: SRGBColorSpace,
      }}
      orthographic={false}
      camera={{
        fov: 45,
        near: 0.1,
        far: 200,
        position: [3, 2, 6],
      }}
    >
      <Experience />
    </Canvas>
  </>,
);
