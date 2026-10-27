import { createContext, useCallback, useContext, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const ToastContext = createContext(null);
let nextId = 1;


export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const notify = useCallback((message, variant = 'success') => {
    setToasts((list) => [...list, { id: nextId++, message, variant }]);
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <ToastContainer position="bottom-start" className="p-3 position-fixed" style={{ zIndex: 2000 }}>
        {/* Every toast is inverted ink (styled in index.css); the message carries the meaning */}
        {toasts.map((t) => (
          <Toast key={t.id} onClose={() => dismiss(t.id)} delay={3500} autohide>
            <Toast.Body>{t.message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
