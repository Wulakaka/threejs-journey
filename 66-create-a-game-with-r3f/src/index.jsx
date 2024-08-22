import "./style.css";
import ReactDOM from "react-dom/client";
import { KeyboardControls } from "@react-three/drei";
import Screens from "./Screens.jsx";

const root = ReactDOM.createRoot(document.querySelector("#root"));

root.render(
  <KeyboardControls
    map={[
      { name: "forward", keys: ["KeyW", "ArrowUp"] },
      { name: "backward", keys: ["KeyS", "ArrowDown"] },
      { name: "leftward", keys: ["KeyA", "ArrowLeft"] },
      { name: "rightward", keys: ["KeyD", "ArrowRight"] },
      { name: "jump", keys: ["Space"] },
    ]}
  >
    <Screens />
  </KeyboardControls>,
);
