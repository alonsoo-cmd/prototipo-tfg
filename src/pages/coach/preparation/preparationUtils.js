import { phaseForWeek } from '../../../data/phases.js';
import { format } from '../../../utils/format.js';

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export function blankWeek(number) {
  const firstDate = new Date(Date.UTC(2026, 9, 21 + (number - 8) * 7));
  return {
    number,
    phase: phaseForWeek(number),
    days: daysOfWeek.map((day, index) => {
      const date = new Date(firstDate);
      date.setUTCDate(firstDate.getUTCDate() + index);
      return {
      day, date: date.getUTCDate(), month: new Intl.DateTimeFormat('es-ES', { month: 'short', timeZone: 'UTC' }).format(date).replace('.', ''), type: '', tone: 'rest', desc: '', mins: 0, km: 0,
      tr: '0', state: 'Planificado', time: '—', blocks: '', wt: [38, 35, 41, 36, 42, 39, 40][index],
      zones: [0, 0, 0], warmup: '', cooldown: '', details: {},
      };
    }),
  };
}

export function copyWeeks(weeks = []) {
  return weeks.map((week) => ({ ...week, days: week.days.map((day) => ({ ...day })) }));
}

export function sumDays(days) {
  return days.reduce((total, day) => ({
    km: total.km + (Number(day.km) || 0), mins: total.mins + (Number(day.mins) || 0),
    tr: total.tr + (Number.parseFloat(day.tr) || 0), wt: total.wt + (Number(day.wt) || 0),
  }), { km: 0, mins: 0, tr: 0, wt: 0 });
}

export function calculatePace(minutes, distance) {
  const totalMinutes = Number(minutes);
  const kilometers = Number(distance);
  if (!totalMinutes || !kilometers) return '';
  const totalSeconds = Math.round((totalMinutes / kilometers) * 60);
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;
}

export function calculateSpeed(minutes, distance) {
  const totalMinutes = Number(minutes);
  const kilometers = Number(distance);
  if (!totalMinutes || !kilometers) return '';
  return format(kilometers / (totalMinutes / 60));
}

function dateRange(days) {
  if (!days.length) return '';
  const first = dayDate(days[0]);
  const last = dayDate(days.at(-1));
  return `${first}–${last}`;
}

export function dayDate(day) {
  return `${day.date} ${day.month || 'oct'}`;
}

function formatWorkoutDate(weekNumber, dayName) {
  const dayIndex = daysOfWeek.indexOf(dayName);
  const date = new Date(Date.UTC(2025, 8, 8 + (weekNumber - 1) * 7 + Math.max(dayIndex, 0)));
  const dateLabel = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', timeZone: 'UTC' }).format(date);
  const weekday = new Intl.DateTimeFormat('es-ES', { weekday: 'long', timeZone: 'UTC' }).format(date);
  return `${dateLabel} - ${weekday}`;
}

export function formatRecentDateRange(workouts) {
  if (!workouts.length) return '';
  const oldest = workouts[workouts.length - 1];
  const newest = workouts[0];
  return `${formatShortDate(oldest.date)} – ${formatShortDate(newest.date)} 2026`;
}

export function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const d = parts[2];
  const m = Number(parts[1]);
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${Number(d)} ${months[m - 1] || 'oct'}`;
}
