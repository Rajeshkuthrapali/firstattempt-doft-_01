import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { initGA4 } from "./lib/analytics";
import { initRUM } from "./lib/rum";
import { initSentry, getErrorBoundary } from "./lib/sentry";
import { reportWebVitals, sendToAnalytics } from "./lib/vitals";

// Initialise synchronous observability first
initGA4();
initRUM();
reportWebVitals(sendToAnalytics);

// Await Sentry before mounting so getErrorBoundary() resolves correctly
initSentry().then(() => {
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
});
