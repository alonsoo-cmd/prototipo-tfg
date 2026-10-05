import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function DatePicker({ value = '', onChange, name, allowClear = false, placeholder = 'Elige una fecha', ariaLabel = 'Elegir fecha' }) {
  const rootRef = useRef(null);
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ left: 12, top: 12, width: 286 });
  const [month, setMonth] = useState(() => monthFor(value));
  const selectedDate = parseDate(value);
  const today = new Date();

  useEffect(() => {
    if (value) setMonth(monthFor(value));
  }, [value]);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutside = (event) => {
      if (!rootRef.current?.contains(event.target) && !popoverRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const closeOnViewportChange = () => setOpen(false);
    document.addEventListener('mousedown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', closeOnViewportChange);
    window.addEventListener('scroll', closeOnViewportChange, true);
    return () => {
      document.removeEventListener('mousedown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('resize', closeOnViewportChange);
      window.removeEventListener('scroll', closeOnViewportChange, true);
    };
  }, [open]);

  const moveMonth = (offset) => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  const show = () => {
    if (!open) {
      const bounds = triggerRef.current?.getBoundingClientRect();
      if (bounds) {
        const width = Math.min(286, window.innerWidth - 24);
        const height = Math.min(360, window.innerHeight - 24);
        const left = Math.max(12, Math.min(bounds.left, window.innerWidth - width - 12));
        const roomBelow = window.innerHeight - bounds.bottom - 8;
        const roomAbove = bounds.top - 8;
        const openAbove = roomBelow < height && roomAbove > roomBelow;
        const top = openAbove
          ? Math.max(12, bounds.top - height - 8)
          : Math.min(bounds.bottom + 8, window.innerHeight - height - 12);
        setPopoverPosition({ left, top, width });
      }
    }
    setOpen((current) => !current);
  };
  const chooseDate = (date) => {
    onChange?.(toIsoDate(date));
    setOpen(false);
  };
  const daysInGrid = buildCalendarDays(month);
  const monthLabel = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(month);

  return <div className="date-picker" ref={rootRef}>
    {name && <input type="hidden" name={name} value={value} />}
    <button ref={triggerRef} type="button" className={`date-picker-trigger ${open ? 'is-open' : ''}`} onClick={show} aria-label={ariaLabel} aria-haspopup="dialog" aria-expanded={open}>
      <span className="date-picker-icon" aria-hidden="true">▦</span>
      <span className={value ? '' : 'date-picker-placeholder'}>{selectedDate ? formatSelectedDate(selectedDate) : placeholder}</span>
      <span className="date-picker-chevron" aria-hidden="true">{open ? '⌃' : '⌄'}</span>
    </button>
    {open && createPortal(<div ref={popoverRef} className="date-picker-popover" style={{ left: popoverPosition.left, top: popoverPosition.top, width: popoverPosition.width }} role="dialog" aria-label="Calendario">
      <div className="date-picker-header">
        <button type="button" className="date-picker-month-arrow" onClick={() => moveMonth(-1)} aria-label="Mes anterior">‹</button>
        <strong>{monthLabel}</strong>
        <button type="button" className="date-picker-month-arrow" onClick={() => moveMonth(1)} aria-label="Mes siguiente">›</button>
      </div>
      <div className="date-picker-grid">
        {weekDays.map((day, index) => <span className="date-picker-weekday" key={`${day}-${index}`}>{day}</span>)}
        {daysInGrid.map((date) => {
          const sameMonth = date.getMonth() === month.getMonth();
          const isSelected = selectedDate && sameDate(date, selectedDate);
          const isToday = sameDate(date, today);
          return <button type="button" key={toIsoDate(date)} onClick={() => chooseDate(date)} className={`date-picker-day ${sameMonth ? '' : 'outside-month'} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`} aria-pressed={Boolean(isSelected)} aria-label={formatSelectedDate(date)}>{date.getDate()}</button>;
        })}
      </div>
      <div className="date-picker-footer">
        {allowClear && <button type="button" onClick={() => { onChange?.(''); setOpen(false); }}>Limpiar</button>}
        <button type="button" className="date-picker-today" onClick={() => chooseDate(new Date())}>Hoy</button>
      </div>
    </div>, document.body)}
  </div>;
}

function parseDate(value) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function monthFor(value) {
  const date = parseDate(value) || new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function buildCalendarDays(month) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index - mondayOffset + 1));
}

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function sameDate(left, right) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

function formatSelectedDate(date) {
  return new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}
