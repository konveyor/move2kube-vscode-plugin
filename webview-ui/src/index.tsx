import React from "react";
import * as ReactDOMClient from "react-dom/client";
import App from "./App";

const rootElement = document.getElementById("root");

ReactDOMClient.createRoot(rootElement as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
