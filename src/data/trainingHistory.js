const weekdays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const weeklyKilometers = [37, 41, 44, 48, 52, 47, 55, 50, 58, 54, 43, 32];
const dayWeights = [0.11, 0.19, 0.12, 0.19, 0.09, 0.16, 0.14];
const workoutTypes = ['Gym + Rodaje', 'Umbral', 'Rodaje', 'Series', 'Gym + Rodaje', 'Competición', 'Long run'];
const workoutDescriptions = [
  'Fuerza general y carrera suave',
  'Bloques de umbral con recuperación',
  'Carrera continua suave',
  'Series controladas',
  'Fuerza y rectas progresivas',
  'Sesión de calidad o competición',
  'Carrera continua larga',
];

const phases = [
  { from: 1, to: 3, name: 'BI · Base' },
  { from: 4, to: 8, name: 'BII · Acumulación' },
  { from: 9, to: 11, name: 'BIII · Competición' },
  { from: 12, to: 12, name: 'Competición' },
];

export const preparationPhases = phases.map((phase) => phase.name);

export function createTrainingHistory(trainingLogs = {}) {
  return weeklyKilometers.flatMap((weeklyTotal, weekIndex) => {
    const preparationWeek = weekIndex + 1;
    const phase = phases.find(({ from, to }) => preparationWeek >= from && preparationWeek <= to).name;

    return weekdays.map((day, dayIndex) => {
      const date = dateFor(preparationWeek, dayIndex);
      const plannedDistance = round(weeklyTotal * dayWeights[dayIndex]);
      const type = workoutTypes[dayIndex];
      const plannedMinutes = Math.round(plannedDistance * paceFactor(type));
      const demoLog = trainingLogs[`${preparationWeek}-${day}`];
      const isRest = false;
      const distance = valueOrDemo(demoLog?.distance, plannedDistance);
      const minutes = valueOrDemo(demoLog?.minutes, plannedMinutes);
      const trimps = valueOrDemo(demoLog?.trimps, Math.round(minutes * effortFactor(type)));
      const mood = demoLog?.mood === '' || demoLog?.mood === undefined ? 6 + ((preparationWeek + dayIndex) % 4) : Number(demoLog.mood);
      const fatigue = demoLog?.fatigue === '' || demoLog?.fatigue === undefined ? 3 + ((preparationWeek + dayIndex * 2) % 5) : Number(demoLog.fatigue);
      const soreness = demoLog?.soreness === '' || demoLog?.soreness === undefined ? 2 + ((preparationWeek + dayIndex) % 5) : Number(demoLog.soreness);
      const sleep = demoLog?.sleep === '' || demoLog?.sleep === undefined ? 6 + ((preparationWeek + dayIndex * 3) % 4) : Number(demoLog.sleep);
      const stress = demoLog?.stress === '' || demoLog?.stress === undefined ? 2 + ((preparationWeek * 2 + dayIndex) % 5) : Number(demoLog.stress);
      const wellbeingTotal = mood + fatigue + soreness + sleep + stress;
      const intensity = type === 'Umbral' || type === 'Series' || type === 'Competición';
      const zoneShares = intensity ? [0.2, 0.15, 0.5, 0.15] : [0.68, 0.22, 0.08, 0.02];
      const saved = Boolean(demoLog);
      const isPast = date <= new Date().toISOString().slice(0, 10);

      return {
        id: `${preparationWeek}-${day}`,
        preparationWeek,
        phase,
        day,
        date,
        type,
        description: workoutDescriptions[dayIndex],
        distance: numberValue(distance),
        minutes: numberValue(minutes),
        trimps: numberValue(trimps),
        pace: demoLog?.pace || formatPace(plannedMinutes, plannedDistance),
        averageHr: numberValue(demoLog?.averageHr || 145 + ((preparationWeek * 3 + dayIndex * 5) % 22)),
        restingHr: numberValue(demoLog?.restingHr || 48 + ((preparationWeek + dayIndex) % 8)),
        hrv: numberValue(demoLog?.hrv || 52 + ((preparationWeek * 4 + dayIndex * 3) % 24)),
        wellbeingTotal,
        zones: zoneShares.map((share) => Math.round(minutes * share)),
        status: saved || isPast ? 'Completado' : 'Planificado',
        isRest,
      };
    });
  });
}

function dateFor(week, dayIndex) {
  const date = new Date(Date.UTC(2026, 7, 24 + (week - 1) * 7 + dayIndex));
  return date.toISOString().slice(0, 10);
}

function valueOrDemo(value, fallback) {
  return value === '' || value === undefined ? fallback : value;
}

function numberValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function paceFactor(type) {
  return type === 'Gym + Rodaje' ? 6 : type === 'Umbral' || type === 'Series' ? 5 : 5.5;
}

function effortFactor(type) {
  return type === 'Umbral' || type === 'Series' || type === 'Competición' ? 1.8 : 1.2;
}

function formatPace(minutes, distance) {
  if (!distance) return '—';
  const totalSeconds = Math.round((minutes / distance) * 60);
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;
}
