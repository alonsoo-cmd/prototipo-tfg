// Fuente única de las fases de la preparación (periodización por bloques).
// La usan el plan del entrenador (coachWeeks), el historial generado y los filtros.

export const preparationPhaseRanges = [
  { from: 1, to: 3, name: 'BI · Base' },
  { from: 4, to: 8, name: 'BII · Acumulación' },
  { from: 9, to: 10, name: 'BII · Transformación' },
  { from: 11, to: 11, name: 'BIII · Realización' },
  { from: 12, to: 12, name: 'Competición' },
];

/** Nombres de las fases en orden cronológico. */
export const preparationPhases = preparationPhaseRanges.map((phase) => phase.name);

/** Fases que el entrenador puede asignar a una semana (incluye la semana de descarga). */
export const phaseOptions = [...preparationPhases, 'Descarga'];

/** Fase por defecto de una semana de la preparación. */
export function phaseForWeek(weekNumber) {
  return preparationPhaseRanges.find(({ from, to }) => weekNumber >= from && weekNumber <= to)?.name
    || preparationPhases.at(-1);
}

/** Fase real de una semana: la asignada en el plan o, si no hay, la de por defecto. */
export function weekPhase(weeks = [], weekNumber) {
  return weeks.find((week) => week.number === weekNumber)?.phase || phaseForWeek(weekNumber);
}
