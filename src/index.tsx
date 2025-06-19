import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./Components/App";

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
