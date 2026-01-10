import { AlertTriangle } from 'lucide-react';

export function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 ...">
      <div className="bg-white rounded-lg ...">
        <AlertTriangle className="text-yellow-600" />
        <h3>確認</h3>
        <p>{message}</p>
        <button onClick={onCancel}>キャンセル</button>
        <button onClick={onConfirm}>削除</button>
      </div>
    </div>
  );
}