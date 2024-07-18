import "./style.css";
import { createRoot } from "react-dom/client";

const root = createRoot(document.querySelector("#root"));

const todo = "react";

root.render(
  <div>
    <h1 className="cute-paragraph">Hello {todo}</h1>
    <p>
      Some <br />
      content {Math.random()}
    </p>
  </div>,
);
