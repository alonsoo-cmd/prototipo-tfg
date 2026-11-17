import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Fondo + caja + botón de cierre comunes a los modales.
 * - Se cierra con Escape o con clic fuera.
 * - Al abrir lleva el foco al modal (o al elemento con `data-autofocus`) y al cerrar lo devuelve.
 * - Mantiene el tabulador dentro del modal y bloquea el scroll de la página de fondo.
 * `as="form"` permite que la caja sea un formulario (el resto de props se pasan a la caja).
 */
export default function ModalShell({ onClose, wide = false, labelledBy, as: Box = 'div', className = '', children, ...boxProps }) {
  const boxRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const box = boxRef.current;
    const previouslyFocused = document.activeElement;
    (box.querySelector('[data-autofocus]') || box).focus({ preventScroll: true });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => { if (event.key === 'Escape') onCloseRef.current(); };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, []);

  // Mantiene el tabulador dentro del modal.
  const trapFocus = (event) => {
    if (event.key !== 'Tab' || !boxRef.current) return;
    const items = [...boxRef.current.querySelectorAll(FOCUSABLE)].filter((element) => element.offsetParent !== null);
    if (!items.length) { event.preventDefault(); return; }
    const first = items[0];
    const last = items.at(-1);
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === boxRef.current)) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && active === last) { event.preventDefault(); first.focus(); }
  };

  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <Box
      {...boxProps}
      ref={boxRef}
      className={['modal', wide && 'wide-modal', className].filter(Boolean).join(' ')}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      tabIndex={-1}
      onKeyDown={trapFocus}
    >
      <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar">×</button>
      {children}
    </Box>
  </div>;
}
