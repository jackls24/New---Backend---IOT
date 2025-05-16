import { StrictMode } from "react";
import React from "react";
import { createRoot } from "react-dom/client";
import "./output.css";
import "./index.css";

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
