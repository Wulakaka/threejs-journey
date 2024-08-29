import { Canvas } from "@react-three/fiber";
import Experience from "./Experience.jsx";
import { useRef, useState } from "react";

export default function App() {
  const container = useRef();
  const domContent = useRef();

  const [isFocusing, setIsFocusing] = useState(false);

  return (
    <div
      className="container"
      ref={container}
      onClick={(e) => {
        if (e.target.classList.contains("container")) {
          setIsFocusing(false);
        }
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          pointerEvents: "none",
        }}
        ref={domContent}
      />
      <Canvas
        className="r3f"
        camera={{
          fov: 45,
          near: 0.1,
          far: 2000,
          position: [-3, 1.5, 4],
        }}
        eventSource={container}
      >
        <Experience
          portal={domContent}
          isFocusing={isFocusing}
          onFocus={() => {
            console.log("onFocus");
            setIsFocusing(true);
          }}
        />
      </Canvas>
    </div>
  );
}
