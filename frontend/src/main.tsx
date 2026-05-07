import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { config, validateConfig, logConfig } from "./config/env";

// Initialize configuration
logConfig();

// Warn if contract IDs are not configured
if (!validateConfig()) {
  console.warn(
    "⚠️  Some contract IDs are not configured. SDK integration will not work until you set environment variables."
  );
}

// Log app info
console.log(
  `%c🚀 STELLAR-EPay Frontend - ${config.env.toUpperCase()}`,
  "font-size: 14px; color: #0f6e56; font-weight: bold;"
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
