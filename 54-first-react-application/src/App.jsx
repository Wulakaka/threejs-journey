import Clicker from "./Clicker.jsx";
import { useState } from "react";

export default function App({ children, clickersCount }) {
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
          {Array(clickersCount)
            .fill(null)
            .map((value, index) => (
              <Clicker
                key={index}
                increment={increment}
                keyName={`count${index}`}
                color={`hsl(${Math.random() * 360}deg, 100%, 70%)`}
              />
            ))}
        </>
      )}
    </>
  );
}
