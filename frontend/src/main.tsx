import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import Lenis from "lenis";

// Initialize Lenis with ultra-smooth momentum and inertia settings
const lenis = new Lenis({
  duration: 1.6, // Increased duration for a softer, longer glide
  easing: (t) => 1 - Math.pow(1 - t, 4), // Quartic easing for a buttery smooth deceleration curve
  smoothWheel: true,
  wheelMultiplier: 0.9, // Slightly dialed back multiplier for precise trackpad/wheel control
  touchMultiplier: 1.5, // Smooth mobile/touch momentum
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