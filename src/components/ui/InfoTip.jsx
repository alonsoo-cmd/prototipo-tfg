import { useEffect, useId, useRef, useState } from 'react';
import { glossary, glossaryKeyFor } from '../../domain/glossary.js';

/**
 * Icono ⓘ con una explicación breve. Se abre al pasar el ratón, con el foco o al pulsarlo
 * (en móvil). Usa posición fija para que no lo recorten tablas ni modales con scroll.
 */
export default function InfoTip({ term, text, label }) {
  const entry = glossary[term];
  const content = text || entry?.text;
  const title = entry?.term || term;
  const [position, setPosition] = useState(null);
  const buttonRef = useRef(null);
  const id = useId();

  const open = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(260, window.innerWidth - 24);
    const left = Math.min(Math.max(12, rect.left + rect.width / 2 - width / 2), window.innerWidth - width - 12);
    const below = rect.bottom + 8 + 140 < window.innerHeight;
    setPosition({ left, width, top: below ? rect.bottom + 8 : undefined, bottom: below ? undefined : window.innerHeight - rect.top + 8 });
  };
  const close = () => setPosition(null);

  useEffect(() => {
    if (!position) return undefined;
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => { window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close); };
  }, [position]);

  if (!content) return null;
  return <span className="info-tip" onMouseEnter={open} onMouseLeave={close}>
    <button
      ref={buttonRef}
      type="button"
      className="info-tip-button"
      aria-label={label || `Qué es ${title}`}
      aria-expanded={Boolean(position)}
      aria-describedby={position ? id : undefined}
      onFocus={open}
      onBlur={close}
      onClick={(event) => { event.preventDefault(); event.stopPropagation(); if (position) close(); else open(); }}
      onKeyDown={(event) => { if (event.key === 'Escape' && position) { event.stopPropagation(); event.nativeEvent.stopImmediatePropagation(); close(); } }}
    >i</button>
    {position && <span role="tooltip" id={id} className="info-tip-bubble" style={position}>
      <b>{title}</b>{content}
    </span>}
  </span>;
}

/** Etiqueta que añade el ⓘ automáticamente si contiene un término del glosario. */
export function TermLabel({ children }) {
  const key = glossaryKeyFor(children);
  return <>{children}{key && <InfoTip term={key} />}</>;
}
