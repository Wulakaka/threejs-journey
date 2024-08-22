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
      { name: "player2forward", keys: ["ArrowUp"] },
      { name: "player2backward", keys: ["ArrowDown"] },
      { name: "player2leftward", keys: ["ArrowLeft"] },
      { name: "player2rightward", keys: ["ArrowRight"] },
      { name: "player2jump", keys: ["Numpad0"] },
    ]}
  >
    <Screens />
  </KeyboardControls>,
);
