import { AlertCircle } from 'lucide-react';

export function ErrorDialog({ message, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-sm w-full shadow-lg">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-600" size={24} />
            <h3 className="text-lg font-bold text-red-600">エラー</h3>
          </div>
          <p className="text-gray-700 mb-6">{message}</p>
          <button
            onClick={onClose}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold"
          >
            了解
          </button>
        </div>
      </div>
    </div>
  );
}
