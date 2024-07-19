import { useState, useEffect } from "react";

export default function Clicker({ keyName, color }) {
  // 需要在 useState 中直接获取，否则通过在 useEffect 中获取之后再设置会导致多次渲染
  const [count, setCount] = useState(
    parseInt(localStorage.getItem(keyName) ?? 0),
  );

  useEffect(() => {
    localStorage.setItem(keyName, count);
  }, [count]);

  useEffect(() => {
    return () => {
      localStorage.removeItem(keyName);
    };
  }, []);

  const buttonClick = () => {
    // setCount((value) => value + 1);
    setCount(count + 1);
  };
  return (
    <div>
      <div style={{ color }}>Click counts: {count}</div>
      <button onClick={buttonClick}>Click me</button>
    </div>
  );
}
