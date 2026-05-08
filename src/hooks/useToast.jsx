import { createContext, useContext, useState, useCallback } from "react";
import React from "react";
const ToastContext = createContext({
  success: (msg) => window.alert(msg),
  error: (msg) => window.alert(msg),
});

export function ToastProvider({ children }) {
  const [lastMessage, setLastMessage] = useState(null);

  const show = useCallback((type, message) => {
    setLastMessage({ type, message, at: Date.now() });
    if (type === "error") {
      window.alert(message);
    } else {
      window.alert(message);
    }
  }, []);

  const success = (msg) => show("success", msg);
  const error = (msg) => show("error", msg);

  return (
    <ToastContext.Provider value={{ success, error, lastMessage }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

