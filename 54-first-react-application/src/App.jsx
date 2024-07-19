import Clicker from "./Clicker.jsx";
import { useState, useMemo } from "react";

export default function App({ children, clickersCount }) {
  const [hasClicker, setHasClicker] = useState(true);
  const [count, setCount] = useState(0);
  const increment = () => {
    setCount(count + 1);
  };

  const toggleClicker = () => {
    setHasClicker(!hasClicker);
  };

  const colors = useMemo(
    () =>
      Array(clickersCount)
        .fill(null)
        .map(() => `hsl(${Math.random() * 360}deg, 100%, 70%)`),
    [clickersCount],
  );

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
                color={colors[index]}
              />
            ))}
        </>
      )}
    </>
  );
}
