import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// Register Service Worker for offline guidance & instant startup
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.info("New emergency guidance cached in background.");
  },
  onOfflineReady() {
    console.info("First30 emergency guidance is cached and available offline.");
  },
});

createRoot(document.getElementById("root")!).render(<App />);
