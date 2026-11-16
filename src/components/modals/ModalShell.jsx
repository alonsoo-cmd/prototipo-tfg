import { useEffect, useRef } from 'react';

/** Fondo + caja + botón de cierre comunes a los modales. Se cierra con Escape o con clic fuera. */
export default function ModalShell({ onClose, wide = false, labelledBy, children }) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === 'Escape') onCloseRef.current(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <div className={'modal ' + (wide ? 'wide-modal' : '')} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
      <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar">×</button>
      {children}
    </div>
  </div>;
}
