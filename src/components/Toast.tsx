import React from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full no-print">
      {toasts.map((t) => {
        const isSuccess = t.tipo === 'success';
        const isError = t.tipo === 'error';

        return (
          <div
            key={t.id}
            className={`flex items-center justify-between p-3.5 rounded-lg shadow-lg border text-sm font-medium transition-all transform animate-in slide-in-from-bottom-3 duration-200 ${
              isSuccess
                ? 'bg-emerald-700 text-white border-emerald-800'
                : isError
                ? 'bg-rose-700 text-white border-rose-800'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-200" />}
              {isError && <AlertTriangle className="w-5 h-5 shrink-0 text-rose-200" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 shrink-0 text-blue-300" />}
              <span className="leading-snug">{t.message}</span>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-white/70 hover:text-white p-1 rounded transition-colors ml-2"
              aria-label="Fechar notificação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
