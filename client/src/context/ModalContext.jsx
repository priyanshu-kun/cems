// Global confirmation modal. Call openModal({ title, body, primaryLabel, ... }).
import { createContext, useCallback, useContext, useState } from "react";
import { Button } from "../components/Button.jsx";

const ModalCtx = createContext(null);

export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null);
  const openModal = useCallback((m) => setModal(m), []);
  const closeModal = useCallback(() => setModal(null), []);

  return (
    <ModalCtx.Provider value={{ openModal, closeModal }}>
      {children}
      {modal ? (
        <div className="modal-root" role="dialog" aria-modal="true" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-grabber" />
            <div className="modal-title">{modal.title}</div>
            {modal.body ? <div className="modal-body">{modal.body}</div> : null}
            <div className="modal-actions">
              <Button
                variant={modal.primaryVariant || "danger"}
                block
                loading={modal.loading}
                onClick={async () => {
                  if (modal.onPrimary) {
                    try { await modal.onPrimary(); } finally { setModal(null); }
                  } else setModal(null);
                }}
              >
                {modal.primaryLabel || "Confirm"}
              </Button>
              <Button variant="ghost" block onClick={closeModal}>
                {modal.secondaryLabel || "Cancel"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </ModalCtx.Provider>
  );
}

export function useModal() {
  const v = useContext(ModalCtx);
  if (!v) throw new Error("useModal must be used inside <ModalProvider>");
  return v;
}
