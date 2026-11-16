import { useEffect, useRef } from 'react';

/**
 * Aviso breve de confirmación (p. ej. "Guardado ✓"). Desaparece solo tras unos segundos.
 * Con `action` muestra además un botón (p. ej. "Deshacer") y se queda algo más de tiempo.
 */
export default function Toast({ message, onDone, action = null, duration }) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const timeout = duration ?? (action ? 6000 : 2800);
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => onDoneRef.current(), timeout);
    return () => clearTimeout(timer);
  }, [message, timeout]);

  if (!message) return null;
  return <div className="toast" role="status" aria-live="polite">
    <span className="toast-icon" aria-hidden="true">✓</span>
    <span>{message}</span>
    {action && <button type="button" className="toast-action" onClick={() => { action.onClick(); onDoneRef.current(); }}>{action.label}</button>}
    <button type="button" className="toast-close" onClick={onDone} aria-label="Cerrar aviso">×</button>
  </div>;
}
