import { useState, useEffect } from "react";

export default function Clicker() {
  // 需要在 useState 中直接获取，否则通过在 useEffect 中获取之后再设置会导致多次渲染
  const [count, setCount] = useState(
    parseInt(localStorage.getItem("count") ?? 0),
  );

  useEffect(() => {
    localStorage.setItem("count", count);
  }, [count]);

  useEffect(() => {
    return () => {
      localStorage.removeItem("count");
    };
  }, []);

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
