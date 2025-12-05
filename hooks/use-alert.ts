// hooks/useAlert.ts
import { useState, useCallback } from 'react';

interface AlertState {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export function useAlert() {
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: 'info',
    message: '',
  });

  const showAlert = useCallback((type: AlertState['type'], message: string, duration = 3000) => {
    setAlert({ show: true, type, message });
    
    // Auto-hide after duration
    if (duration > 0) {
      setTimeout(() => {
        setAlert(prev => ({ ...prev, show: false }));
      }, duration);
    }
  }, []);

  const hideAlert = useCallback(() => {
    setAlert(prev => ({ ...prev, show: false }));
  }, []);

  return {
    alert,
    showAlert,
    hideAlert,
    showSuccess: (message: string, duration?: number) => showAlert('success', message, duration),
    showError: (message: string, duration?: number) => showAlert('error', message, duration),
    showWarning: (message: string, duration?: number) => showAlert('warning', message, duration),
    showInfo: (message: string, duration?: number) => showAlert('info', message, duration),
  };
}