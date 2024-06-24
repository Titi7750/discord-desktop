import { ReactNode, createContext, useContext, useMemo } from "react";

export type AppSocket = {
  onMessage(callback: (message: unknown) => void): () => void;
  send(message: unknown): void;
};

declare global {
  interface Window {
    MessageAPI: {
      addMessageListener(callback: (message: unknown) => void): () => void;
      send(message: unknown): void;
    }
  }
}

const context = createContext<AppSocket | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const appSocket = useMemo<AppSocket>(
    () => ({
      onMessage(callback) {
        return window.MessageAPI.addMessageListener(callback);
      },

      send(message) {
        window.MessageAPI.send(message);
      },
    }),
    []
  );

  return <context.Provider value={appSocket}>{children}</context.Provider>;
}

export function useSocket() {
  const socket = useContext(context);
  if (!socket) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return socket;
}
