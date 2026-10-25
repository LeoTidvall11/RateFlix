import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Toast from 'components/Toast';

const TOAST_DURATION = 2500;

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const hideTimer = useRef(null);

  const hideToast = useCallback(() => {
    clearTimeout(hideTimer.current);
    setToast(null);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    clearTimeout(hideTimer.current);
    setToast({ id: Date.now(), message, type });
    hideTimer.current = setTimeout(() => setToast(null), TOAST_DURATION);
  }, []);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast ? (
        <Toast key={toast.id} message={toast.message} type={toast.type} onPress={hideToast} />
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast måste användas inuti <ToastProvider>');
  return context;
}
