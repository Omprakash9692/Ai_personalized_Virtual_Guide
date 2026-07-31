import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function Toast() {
  const { toastMessage } = useUser();

  if (!toastMessage) return null;

  const { message, type } = toastMessage;

  const bgStyles = {
    success: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 shadow-sm',
    error: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 shadow-sm',
    info: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 shadow-sm',
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
