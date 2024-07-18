import { useState } from "react";

export default function Clicker() {
  const [count, setCount] = useState(0);

  const buttonClick = () => {
    // setCount((value) => value + 1);
    setCount(count + 1);
  };
  return (
    <div>
      <div>Click counts: {count}</div>
      <button onClick={buttonClick}>Click me</button>
    </div>
  );
}
