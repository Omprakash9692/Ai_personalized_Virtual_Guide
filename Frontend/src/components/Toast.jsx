import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function Toast() {
  const { toastMessage } = useUser();

  if (!toastMessage) return null;

  const { message, type } = toastMessage;

  const bgStyles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm',
    error: 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm',
    info: 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm',
  };

  const Icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  };

  const Icon = Icons[type] || Info;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div
        className={`flex items-center space-x-3 px-4 py-3 rounded-2xl border shadow-lg text-xs sm:text-sm font-medium ${
          bgStyles[type] || bgStyles.info
        }`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span>{message}</span>
      </div>
    </div>
  );
}
