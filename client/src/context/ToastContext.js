import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';

// =====================================================
// Toast Context — replaces alert() across the app
// =====================================================
const ToastContext = createContext();

let toastId = 0;

const ICONS = {
  success: <FiCheckCircle style={{ color: 'var(--success)' }} />,
  error: <FiXCircle style={{ color: 'var(--error)' }} />,
  warning: <FiAlertTriangle style={{ color: 'var(--warning)' }} />,
  info: <FiInfo style={{ color: 'var(--primary)' }} />,
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    timersRef.current[id] = setTimeout(() => removeToast(id), duration);
    return id;
  }, [removeToast]);

  // Convenience methods
  const success = useCallback((msg) => toast(msg, 'success'), [toast]);
  const error = useCallback((msg) => toast(msg, 'error', 5000), [toast]);
  const warning = useCallback((msg) => toast(msg, 'warning'), [toast]);
  const info = useCallback((msg) => toast(msg, 'info'), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      {/* Toast container renders at top-right of viewport */}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map((t) => (
            <div key={t.id} className={`toast toast-${t.type}`}>
              <span className="toast-icon">{ICONS[t.type]}</span>
              <span className="toast-message">{t.message}</span>
              <button className="toast-close" onClick={() => removeToast(t.id)} aria-label="Dismiss">
                <FiX />
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

// =====================================================
// ConfirmDialog — replaces window.confirm()
// =====================================================
const ConfirmContext = createContext();

export const ConfirmProvider = ({ children }) => {
  const [dialog, setDialog] = useState(null);
  const resolveRef = useRef(null);

  const confirm = useCallback((message, { title = 'Confirm', confirmText = 'Delete', cancelText = 'Cancel' } = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setDialog({ title, message, confirmText, cancelText });
    });
  }, []);

  const handleConfirm = () => {
    resolveRef.current?.(true);
    setDialog(null);
  };

  const handleCancel = () => {
    resolveRef.current?.(false);
    setDialog(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {dialog && (
        <div className="confirm-overlay" onClick={handleCancel}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>{dialog.title}</h3>
            <p>{dialog.message}</p>
            <div className="confirm-actions">
              <button className="confirm-btn confirm-btn-cancel" onClick={handleCancel}>
                {dialog.cancelText}
              </button>
              <button className="confirm-btn confirm-btn-danger" onClick={handleConfirm}>
                {dialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider');
  return ctx.confirm;
};
