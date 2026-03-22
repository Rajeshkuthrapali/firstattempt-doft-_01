import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { initGA4 } from "./lib/analytics.ts";
import { initRUM } from "./lib/rum.ts";
import { initSentry, getErrorBoundary } from "./lib/sentry.ts";

// Initialise observability (no-ops if env vars are not set)
initGA4();
initRUM();
void initSentry();

const ErrorBoundary = getErrorBoundary();
const AppTree = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

createRoot(document.getElementById("root")!).render(
  ErrorBoundary ? (
    <ErrorBoundary fallback={<p>Something went wrong. Please refresh.</p>}>
      {AppTree}
    </ErrorBoundary>
  ) : (
    AppTree
  ),
);
