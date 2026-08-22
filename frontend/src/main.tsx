// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import Lenis from "lenis";
import "lenis/dist/lenis.css";

const lenis = new Lenis({
  // Lowered from 0.18 to 0.12. This adds that slight, premium delay/momentum.
  lerp: 0.12,

  // Kept at 1.4 so you still travel a good distance per scroll wheel notch.
  wheelMultiplier: 1.4,
});

function raf(time: number) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);