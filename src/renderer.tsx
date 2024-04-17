import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";
import { SocketProvider } from "./providers/SocketProvider";

const rootElement = document.getElementById("#root");

if (rootElement) {
  createRoot(rootElement).render(
    <SocketProvider>
      <App />
    </SocketProvider>
  );
}