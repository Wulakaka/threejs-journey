import Clicker from "./Clicker.jsx";
import { useState } from "react";

export default function App({ children }) {
  const [hasClicker, setHasClicker] = useState(true);
  const [count, setCount] = useState(0);
  const increment = () => {
    setCount(count + 1);
  };

  const toggleClicker = () => {
    setHasClicker(!hasClicker);
  };
  return (
    <>
      {children}
      <button onClick={toggleClicker}>
        {hasClicker ? "Hide" : "Show"} Clicker
      </button>
      <div>Total count: {count}</div>
      {hasClicker && (
        <>
          <Clicker
            increment={increment}
            keyName="countA"
            color={`hsl(${Math.random() * 360}deg, 100%, 70%)`}
          />
          <Clicker
            increment={increment}
            keyName="countB"
            color={`hsl(${Math.random() * 360}deg, 100%, 70%)`}
          />
          <Clicker
            increment={increment}
            keyName="countC"
            color={`hsl(${Math.random() * 360}deg, 100%, 70%)`}
          />
        </>
      )}
    </>
  );
}
