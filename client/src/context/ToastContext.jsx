// Global toast + modal contexts. Tiny and dependency-free.
import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((t) => {
    const id = "t_" + Math.random().toString(36).slice(2, 8);
    const item = { id, kind: "default", duration: 3500, ...(typeof t === "string" ? { text: t } : t) };
    setToasts((arr) => [...arr, item].slice(-4));
    setTimeout(() => setToasts((arr) => arr.filter((x) => x.id !== id)), item.duration);
  }, []);

  const api = useMemo(() => ({
    toast: push,
    success: (text) => push({ kind: "success", text }),
    error: (text) => push({ kind: "danger", text }),
    info: (text) => push({ kind: "default", text }),
  }), [push]);

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} />
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const v = useContext(ToastCtx);
  if (!v) throw new Error("useToast must be used inside <ToastProvider>");
  return v;
}

function ToastViewport({ toasts }) {
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.kind}`}>
          <span className="toast-dot" aria-hidden="true" />
          <div className="toast-body">{t.text}</div>
        </div>
      ))}
    </div>
  );
}
