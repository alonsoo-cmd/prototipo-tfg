import { logKey } from '../domain/training.js';
import { demoCompletionStatus } from './trainingHistory.js';
import { sessionDateKey, todayKey } from '../domain/calendar.js';

/**
 * Historial del modo "grupo": se construye a partir del plan del entrenador
 * (coachWeeks) y del estado registrado en trainingLogs, con valores de ejemplo.
 */
export function createGroupHistory(coachWeeks = [], trainingLogs = {}) {
  return coachWeeks.flatMap((week) => week.days.map((day, index) => {
    const dateStr = sessionDateKey(week.number, index);
    const isPast = dateStr <= todayKey();
    const log = trainingLogs[logKey(week.number, day.day)];
    let completionStatus = log?.completionStatus;
    if (!completionStatus && isPast) completionStatus = day.type ? demoCompletionStatus(week.number, index) : 'completed';
    const status = completionStatus === 'completed'
      ? 'Completado'
      : completionStatus === 'partial'
        ? 'A medias'
        : completionStatus === 'missed'
          ? 'No realizado'
          : 'Planificado';
    return {
      id: `${week.number}-${day.day}`,
      preparationWeek: week.number,
      phase: week.phase,
      day: day.day,
      date: dateStr,
      type: day.type || 'Descanso',
      description: day.desc || '',
      distance: Number(day.km) || 0,
      minutes: Number(day.mins) || 0,
      trimps: Number(day.tr) || 0,
      pace: '5:00',
      averageHr: 140, restingHr: 50, hrv: 50, wellbeingTotal: 0,
      rpe: 6,
      notes: day.desc || 'Entrenamiento de grupo',
      zones: [0, 0, 0, 0],
      status,
      completionStatus: completionStatus || 'unreported',
      isRest: !day.type
    };
  }));
}
