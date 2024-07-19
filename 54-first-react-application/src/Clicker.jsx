import { useState, useEffect, useRef } from "react";

export default function Clicker({ keyName, color, increment }) {
  // 需要在 useState 中直接获取当前值，否则通过在 useEffect 中获取之后再设置会导致多次渲染
  const [count, setCount] = useState(
    parseInt(localStorage.getItem(keyName) ?? 0),
  );

  const buttonRef = useRef();

  useEffect(() => {
    localStorage.setItem(keyName, count);
  }, [count]);

  useEffect(() => {
    buttonRef.current.style.backgroundColor = "papayawhip";
    buttonRef.current.style.color = "salmon";
    return () => {
      localStorage.removeItem(keyName);
    };
  }, []);

  const buttonClick = () => {
    // setCount((value) => value + 1);
    setCount(count + 1);
    increment();
  };
  return (
    <div>
      <div style={{ color }}>Click counts: {count}</div>
      <button ref={buttonRef} onClick={buttonClick}>
        Click me
      </button>
    </div>
  );
}
