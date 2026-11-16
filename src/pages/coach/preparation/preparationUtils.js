import { phaseForWeek } from '../../../data/phases.js';
import { format } from '../../../utils/format.js';
import { DAYS_OF_WEEK, sessionDayFields } from '../../../domain/calendar.js';

const daysOfWeek = DAYS_OF_WEEK;

export function blankWeek(number) {
  return {
    number,
    phase: phaseForWeek(number),
    days: daysOfWeek.map((day, index) => {
      return {
      day, ...sessionDayFields(number, index), type: '', tone: 'rest', desc: '', mins: 0, km: 0,
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
  return `${day.date} ${day.month || ''}`.trim();
}

export function formatRecentDateRange(workouts) {
  if (!workouts.length) return '';
  const oldest = workouts[workouts.length - 1];
  const newest = workouts[0];
  return `${formatShortDate(oldest.date)} – ${formatShortDate(newest.date)} ${newest.date.slice(0, 4)}`;
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
