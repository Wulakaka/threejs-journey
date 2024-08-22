import "./style.css";
import ReactDOM from "react-dom/client";
import { KeyboardControls } from "@react-three/drei";
import Screens from "./Screens.jsx";

const root = ReactDOM.createRoot(document.querySelector("#root"));

root.render(
  <KeyboardControls
    map={[
      { name: "player1forward", keys: ["KeyW"] },
      { name: "player1backward", keys: ["KeyS"] },
      { name: "player1leftward", keys: ["KeyA"] },
      { name: "player1rightward", keys: ["KeyD"] },
      { name: "player1jump", keys: ["Space"] },
      { name: "player2forward", keys: ["ArrowUp", "Numpad8"] },
      { name: "player2backward", keys: ["ArrowDown", "Numpad5"] },
      { name: "player2leftward", keys: ["ArrowLeft", "Numpad4"] },
      { name: "player2rightward", keys: ["ArrowRight", "Numpad6"] },
      { name: "player2jump", keys: ["Numpad0"] },
    ]}
  >
    <Screens />
  </KeyboardControls>,
);
