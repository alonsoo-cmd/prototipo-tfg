/** Número en formato español (coma decimal). Con `fixedDigits` fija los decimales (7 → «7,0»). */
export function format(value, fixedDigits) {
  const options = fixedDigits === undefined ? { maximumFractionDigits: 1 } : { minimumFractionDigits: fixedDigits, maximumFractionDigits: fixedDigits };
  return new Intl.NumberFormat('es-ES', options).format(Number(value) || 0);
}

/** Fecha ISO (AAAA-MM-DD) → «6 de diciembre de 2026». */
export function formatLongDate(value) {
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}
