// Calendario único del prototipo. Todas las fechas de la preparación salen de aquí.
//
// - La preparación empieza el lunes 14 sep 2026 (semana 1) y dura 12 semanas:
//   la semana 12 va del 30 nov al 6 dic, día de la Media Maratón de Madrid.
// - El «hoy» de la demostración está fijo en el miércoles 4 nov 2026 (semana 8),
//   para que la demo se vea igual sea cual sea el día real.
//   No usar today() en selectores de fecha reales (DatePicker, años de experiencia).

const DAY_MS = 24 * 60 * 60 * 1000;

export const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

/** Lunes de la semana 1, en UTC. */
export const PREPARATION_START = new Date(Date.UTC(2026, 8, 14));

/** «Hoy» de la demostración, en UTC. */
export const DEMO_TODAY = new Date(Date.UTC(2026, 10, 4));

const shortMonth = new Intl.DateTimeFormat('es-ES', { month: 'short', timeZone: 'UTC' });

/** Copia de la fecha de hoy (demo). */
export function today() {
  return new Date(DEMO_TODAY);
}

/** Hoy como clave ISO «AAAA-MM-DD». */
export function todayKey() {
  return toKey(DEMO_TODAY);
}

/** Lunes de la semana `n` de la preparación. */
export function weekMonday(weekNumber) {
  return new Date(PREPARATION_START.getTime() + (weekNumber - 1) * 7 * DAY_MS);
}

/** Fecha del día `dayIndex` (0 = lunes) o del día con nombre `dayName` de la semana `n`. */
export function sessionDate(weekNumber, day) {
  const dayIndex = typeof day === 'number' ? day : Math.max(DAYS_OF_WEEK.indexOf(day), 0);
  return new Date(weekMonday(weekNumber).getTime() + dayIndex * DAY_MS);
}

/** Clave ISO «AAAA-MM-DD» de un día de la preparación. */
export function sessionDateKey(weekNumber, day) {
  return toKey(sessionDate(weekNumber, day));
}

/** Número de día y mes abreviado («nov») para las tarjetas del plan. */
export function sessionDayFields(weekNumber, day) {
  const date = sessionDate(weekNumber, day);
  return { date: date.getUTCDate(), month: monthShort(date) };
}

/** Semana de la preparación que contiene hoy. */
export function currentWeek() {
  return Math.floor((DEMO_TODAY - PREPARATION_START) / (7 * DAY_MS)) + 1;
}

/** Semana actual como constante, para valores por defecto. */
export const CURRENT_WEEK = currentWeek();

/** «2 — 8 nov» o «28 sep — 4 oct». */
export function weekRange(weekNumber) {
  const monday = weekMonday(weekNumber);
  const sunday = sessionDate(weekNumber, 6);
  const startMonth = monthShort(monday);
  const endMonth = monthShort(sunday);
  if (startMonth === endMonth) return `${monday.getUTCDate()} — ${sunday.getUTCDate()} ${startMonth}`;
  return `${monday.getUTCDate()} ${startMonth} — ${sunday.getUTCDate()} ${endMonth}`;
}

function monthShort(date) {
  return shortMonth.format(date).replace('.', '');
}

function toKey(date) {
  return date.toISOString().slice(0, 10);
}
