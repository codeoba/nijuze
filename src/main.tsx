import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

const loadingScreen = document.getElementById("loading-screen");
if (loadingScreen) {
  loadingScreen.classList.add("hidden");
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);

