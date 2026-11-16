import { logKey } from '../domain/training.js';

/**
 * Historial del modo "grupo": se construye a partir del plan del entrenador
 * (coachWeeks) y del estado registrado en trainingLogs, con valores de ejemplo.
 */
export function createGroupHistory(coachWeeks = [], trainingLogs = {}) {
  return coachWeeks.flatMap((week) => week.days.map((day, index) => {
    const dateObj = new Date(Date.UTC(2026, 7, 24 + (week.number - 1) * 7 + index));
    const dateStr = dateObj.toISOString().slice(0, 10);
    const todayKey = new Date().toLocaleDateString('en-CA');
    const isPast = dateStr <= todayKey;
    const log = trainingLogs[logKey(week.number, day.day)];
    let completionStatus = log?.completionStatus;
    if (!completionStatus && isPast) {
      if ((week.number === 7 && index === 0) || (week.number === 8 && index === 1)) {
        completionStatus = 'partial';
      } else if (week.number === 7 && index === 2) {
        completionStatus = 'missed';
      } else {
        completionStatus = 'completed';
      }
    }
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
