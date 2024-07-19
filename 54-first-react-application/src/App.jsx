import Clicker from "./Clicker.jsx";
import { useState } from "react";

export default function App() {
  const [hasClicker, setHasClicker] = useState(true);

  const toggleClicker = () => {
    setHasClicker(!hasClicker);
  };
  return (
    <>
      <button onClick={toggleClicker}>
        {hasClicker ? "Hide" : "Show"} Clicker
      </button>
      {hasClicker && <Clicker />}
    </>
  );
}
