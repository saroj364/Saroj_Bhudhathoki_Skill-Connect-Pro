import { useToast } from './ToastContext';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-500',
          text: 'text-green-800',
          icon: 'text-green-600'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-500',
          text: 'text-red-800',
          icon: 'text-red-600'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-500',
          text: 'text-yellow-800',
          icon: 'text-yellow-600'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-500',
          text: 'text-blue-800',
          icon: 'text-blue-600'
        };
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 w-full max-w-sm">
      {toasts.map((toast) => {
        const styles = getToastStyles(toast.type);
        return (
          <div
            key={toast.id}
            className={`${styles.bg} ${styles.border} border-l-4 rounded-lg shadow-lg p-4 flex items-start gap-3 animate-in slide-in-from-right-5 duration-300`}
          >
            <div className={styles.icon}>{getIcon(toast.type)}</div>
            <div className="flex-1">
              <p className={`${styles.text} font-medium text-sm`}>{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className={`${styles.text} hover:opacity-70 transition-opacity`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}

