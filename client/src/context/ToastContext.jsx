import { createContext, useCallback, useContext, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const ToastContext = createContext(null);
let nextId = 1;

// Toasts use the palette: black for success, red for errors, white for neutral notices
const TOAST_STYLES = {
  success: { bg: 'dark', text: 'text-white' },
  danger: { bg: 'danger', text: 'text-white' },
  secondary: { bg: 'light', text: 'text-body' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const notify = useCallback((message, variant = 'success') => {
    setToasts((list) => [...list, { id: nextId++, message, variant }]);
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <ToastContainer position="bottom-end" className="p-3 position-fixed" style={{ zIndex: 2000 }}>
        {toasts.map((t) => {
          const style = TOAST_STYLES[t.variant] || TOAST_STYLES.success;
          return (
            <Toast key={t.id} bg={style.bg} onClose={() => dismiss(t.id)} delay={3500} autohide>
              <Toast.Body className={`${style.text} fw-medium`}>{t.message}</Toast.Body>
            </Toast>
          );
        })}
      </ToastContainer>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
