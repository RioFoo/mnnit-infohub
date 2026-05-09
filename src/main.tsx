import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { installProductionLogger } from "./lib/productionLogger";

installProductionLogger();

createRoot(document.getElementById("root")!).render(<App />);
