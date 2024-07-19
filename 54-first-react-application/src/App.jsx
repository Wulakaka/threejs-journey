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
      {hasClicker && (
        <>
          <Clicker
            keyName="countA"
            color={`hsl(${Math.random() * 360}deg, 100%, 70%)`}
          />
          <Clicker
            keyName="countB"
            color={`hsl(${Math.random() * 360}deg, 100%, 70%)`}
          />
          <Clicker
            keyName="countC"
            color={`hsl(${Math.random() * 360}deg, 100%, 70%)`}
          />
        </>
      )}
    </>
  );
}
