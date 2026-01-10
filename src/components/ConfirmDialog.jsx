import { AlertTriangle } from 'lucide-react';

export function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-sm w-full shadow-lg">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-yellow-600" size={24} />
            <h3 className="text-lg font-bold text-gray-800">確認</h3>
          </div>
          <p className="text-gray-700 mb-6">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              キャンセル
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold"
            >
              削除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}