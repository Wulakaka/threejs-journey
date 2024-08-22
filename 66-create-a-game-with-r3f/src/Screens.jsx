import { Canvas } from "@react-three/fiber";
import Experience from "./Experience.jsx";
import Interface from "./Interface.jsx";
import * as THREE from "three";

const scene = new THREE.Scene();
const camera2 = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
camera2.position.set(2.5, 4, 6);

export default function Screens() {
  return (
    <div className="screens">
      <div>
        <Canvas
          shadows
          camera={{
            fov: 45,
            near: 0.1,
            far: 200,
            position: [2.5, 4, 6],
          }}
          scene={scene}
        >
          <Experience camera2={camera2} />
        </Canvas>
        <Interface />
      </div>
      <div>
        <Canvas shadows scene={scene} camera={camera2}></Canvas>
        <Interface player="player2" />
      </div>
    </div>
  );
}
