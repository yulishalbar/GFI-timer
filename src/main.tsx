import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import "./styles/tokens.css";
import "./styles/global.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Application root element was not found.");
}

window.history.scrollRestoration = "manual";
window.scrollTo({ top: 0, left: 0, behavior: "instant" });
document.documentElement.scrollTop = 0;
document.body.scrollTop = 0;

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
