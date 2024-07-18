import "./style.css";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

const root = createRoot(document.querySelector("#root"));

const todo = "react";

root.render(
  <div>
    <App />
  </div>,
);
