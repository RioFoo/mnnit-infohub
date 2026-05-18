import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { installProductionLogger } from "./lib/productionLogger";
import { installNavigationGuard } from "./lib/navigationGuard";

installProductionLogger();
installNavigationGuard();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
