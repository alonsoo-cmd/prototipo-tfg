export function format(value) { return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }).format(Number(value) || 0); }

/** Fecha ISO (AAAA-MM-DD) → «6 de diciembre de 2026». */
export function formatLongDate(value) {
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}
