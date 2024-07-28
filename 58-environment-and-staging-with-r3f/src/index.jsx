import "./style.css";
import ReactDOM from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import Experience from "./Experience.jsx";
import { Leva } from "leva";

const root = ReactDOM.createRoot(document.querySelector("#root"));

function created(state) {
  console.log(state);
}

root.render(
  <>
    <Leva collapsed></Leva>
    <Canvas
      shadows={false}
      camera={{
        fov: 45,
        near: 0.1,
        far: 200,
        position: [-4, 3, 6],
      }}
      onCreated={created}
    >
      <color args={["ivory"]} attach="background"></color>
      <Experience />
    </Canvas>
  </>,
);
