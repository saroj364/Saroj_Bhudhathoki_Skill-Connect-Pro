  export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning' }) {
    if (!isOpen) return null;

    const typeStyles = {
      warning: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-500',
        button: 'bg-yellow-600 hover:bg-yellow-700'
      },
      danger: {
        bg: 'bg-red-50',
        border: 'border-red-500',
        button: 'bg-red-600 hover:bg-red-700'
      },
      info: {
        bg: 'bg-blue-50',
        border: 'border-blue-500',
        button: 'bg-blue-600 hover:bg-blue-700'
      }
    };

    const styles = typeStyles[type] || typeStyles.warning;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`${styles.bg} ${styles.border} border-l-4 rounded-lg shadow-xl max-w-md w-full p-6`}>
          <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
          <p className="text-gray-700 mb-6">{message}</p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`${styles.button} text-white px-4 py-2 rounded-lg font-medium transition-colors`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  }

