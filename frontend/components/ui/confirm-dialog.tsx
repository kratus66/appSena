'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './button';

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
};

type State =
  | (ConfirmOptions & { open: boolean; resolve: (v: boolean) => void })
  | null;

let listeners: Array<(s: State) => void> = [];
let current: State = null;

function emit(s: State) {
  current = s;
  listeners.forEach((l) => l(s));
}

/**
 * Diálogo de confirmación imperativo con estética de marca.
 * Reemplaza a window.confirm(): `if (!(await confirmDialog('¿Seguro?'))) return;`
 */
export function confirmDialog(opts: string | ConfirmOptions): Promise<boolean> {
  const options: ConfirmOptions = typeof opts === 'string' ? { description: opts } : opts;
  return new Promise((resolve) => {
    emit({ ...options, open: true, resolve });
  });
}

/** Montar una sola vez en el layout raíz. */
export function ConfirmHost() {
  const [state, setState] = React.useState<State>(current);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      listeners = listeners.filter((l) => l !== setState);
    };
  }, []);

  const close = React.useCallback(
    (result: boolean) => {
      setState((s) => {
        s?.resolve(result);
        return s ? { ...s, open: false } : null;
      });
      window.setTimeout(() => emit(null), 160);
    },
    []
  );

  React.useEffect(() => {
    if (!state?.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false);
      if (e.key === 'Enter') close(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state?.open, close]);

  if (!state || !state.open) return null;
  const destructive = state.destructive ?? true;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-overlay-in"
      role="alertdialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/50" onClick={() => close(false)} />
      <div className="relative w-full max-w-sm rounded-xl bg-white shadow-2xl animate-fade-in">
        <div className="p-6">
          <div className="flex gap-4">
            <span
              className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${
                destructive ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-700'
              }`}
            >
              <AlertTriangle size={20} />
            </span>
            <div className="flex-1 pt-0.5">
              <h3 className="text-base font-semibold text-gray-900">
                {state.title ?? 'Confirmar acción'}
              </h3>
              {state.description && (
                <p className="mt-1 text-sm text-gray-600">{state.description}</p>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => close(false)}>
              {state.cancelText ?? 'Cancelar'}
            </Button>
            <Button
              variant={destructive ? 'destructive' : 'default'}
              onClick={() => close(true)}
              autoFocus
            >
              {state.confirmText ?? 'Confirmar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}