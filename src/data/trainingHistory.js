import { weekPhase } from './phases.js';
import { sessionDateKey, todayKey } from '../domain/calendar.js';

const weekdays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const weeklyKilometers = [37, 41, 44, 48, 52, 47, 55, 50, 58, 54, 43, 32];
// Reparto del volumen semanal: la tirada larga del domingo es la sesión más larga.
const dayWeights = [0.12, 0.15, 0.12, 0.16, 0.1, 0.11, 0.24];
const baseWeekTypes = ['Gym + Rodaje', 'Umbral', 'Rodaje', 'Series', 'Gym + Rodaje', 'Rodaje', 'Long run'];

// Semanas con competición: control de 10 km (sem. 5), universitarios (sem. 8)
// y la Media Maratón de Madrid el domingo de la semana 12.
const competitions = {
  5: { dayIndex: 5, distance: 10, description: 'Control de 10 km en ruta' },
  8: { dayIndex: 5, distance: 8, description: 'Cross universitario' },
  12: { dayIndex: 6, distance: 21.1, description: 'Media Maratón de Madrid' },
};

const workoutDescriptions = {
  'Gym + Rodaje': 'Fuerza general y carrera suave',
  'Umbral': 'Bloques de umbral con recuperación',
  'Rodaje': 'Carrera continua suave',
  'Series': 'Series controladas',
  'Long run': 'Carrera continua larga',
  'Competición': 'Competición',
};

// Ritmo medio de la sesión completa en min/km (incluye calentamiento y recuperaciones).
const sessionPace = { 'Gym + Rodaje': 5.6, 'Rodaje': 5.4, 'Long run': 5.3, 'Umbral': 4.75, 'Series': 4.85, 'Competición': 4.3 };

// FC media (ppm) por tipo: rodaje < tirada < umbral < series < competición.
const heartRate = { 'Gym + Rodaje': [136, 6], 'Rodaje': [138, 7], 'Long run': [146, 6], 'Umbral': [158, 6], 'Series': [165, 6], 'Competición': [173, 5] };

// RPE habitual por tipo (mínimo y amplitud).
const rpeRange = { 'Gym + Rodaje': [4, 2], 'Rodaje': [3, 2], 'Long run': [5, 2], 'Umbral': [7, 2], 'Series': [8, 2], 'Competición': [9, 1] };

const effortShare = {
  easy: [0.7, 0.22, 0.06, 0.02],
  hard: [0.25, 0.2, 0.42, 0.13],
};

const sampleNotes = {
  'Gym + Rodaje': ['Fuerza completa, piernas algo cargadas al rodar', 'Buen tono en el gimnasio y rodaje fácil', 'Sentadilla pesada; el rodaje costó al principio'],
  'Umbral': ['Bloques controlados, pulsaciones estables', 'El último bloque se hizo largo', 'Ritmo de umbral cómodo, buena señal'],
  'Rodaje': ['Rodaje suave y regenerativo', 'Piernas sueltas, ritmo conversacional', 'Algo de viento, pero sin forzar'],
  'Series': ['Series intensas con buena técnica', 'Las dos últimas repeticiones costaron', 'Recuperaciones cortas, buen ritmo'],
  'Long run': ['Tirada larga con buena asimilación', 'Final progresivo sin problemas', 'Últimos 3 km pesados, hidratación justa'],
  'Competición': ['Salida prudente y buen final', 'Carrera dura, ritmo por encima de lo previsto'],
};

const partialNotes = ['Corté antes por molestias en el gemelo', 'Muy cansado: hice la mitad de la sesión', 'Me quedé sin tiempo y recorté el final'];
const missedNotes = ['No pude entrenar por trabajo', 'Resfriado, descanso total', 'Viaje: sin entrenamiento'];

/** Tipo de sesión de un día concreto (la competición solo aparece en sus semanas). */
export function historyWorkoutType(week, dayIndex) {
  const competition = competitions[week];
  if (competition?.dayIndex === dayIndex) return 'Competición';
  if (competition && dayIndex === competition.dayIndex - 1) return 'Rodaje'; // día previo suave
  return baseWeekTypes[dayIndex];
}

/**
 * Estado de ejemplo de una sesión ya pasada: cada semana hay una sesión a medias
 * y, una de cada tres semanas, otra no realizada. Nunca afecta a la competición.
 */
export function demoCompletionStatus(week, dayIndex) {
  if (competitions[week]?.dayIndex === dayIndex) return 'completed';
  if (dayIndex === (week * 3 + 1) % 7) return 'partial';
  if (week % 3 === 1 && dayIndex === (week * 5 + 4) % 7) return 'missed';
  return 'completed';
}

/**
 * Genera el historial de 12 semanas. Los registros reales de `trainingLogs`
 * sustituyen a los valores de ejemplo y la fase sale del plan (`weeks`) si se pasa.
 */
export function createTrainingHistory(trainingLogs = {}, weeks = []) {
  return weeklyKilometers.flatMap((weeklyTotal, weekIndex) => {
    const preparationWeek = weekIndex + 1;
    const phase = weekPhase(weeks, preparationWeek);

    return weekdays.map((day, dayIndex) => {
      const date = sessionDateKey(preparationWeek, dayIndex);
      const type = historyWorkoutType(preparationWeek, dayIndex);
      const competition = type === 'Competición' ? competitions[preparationWeek] : null;
      // Variación determinista (misma demo en cada carga) que cambia con la semana y el día.
      const jitter = (amplitude, salt = 0) => ((preparationWeek * 31 + dayIndex * 17 + salt * 7) % (amplitude + 1));
      const plannedDistance = competition ? competition.distance : round(weeklyTotal * dayWeights[dayIndex]);
      const plannedMinutes = Math.round(plannedDistance * sessionPace[type]);
      const demoLog = trainingLogs[`${preparationWeek}-${day}`];
      const isRest = false;
      const isPast = date <= todayKey();

      let completionStatus;
      if (demoLog?.completionStatus) completionStatus = demoLog.completionStatus;
      else if (isPast) completionStatus = demoCompletionStatus(preparationWeek, dayIndex);
      else completionStatus = 'unreported';
      const done = completionStatus === 'missed' ? 0 : completionStatus === 'partial' ? 0.55 : 1;

      const distance = valueOrDemo(demoLog?.distance, round(plannedDistance * done));
      const minutes = valueOrDemo(demoLog?.minutes, Math.round(plannedMinutes * done));
      const intensity = type === 'Umbral' || type === 'Series' || type === 'Competición';
      const mood = demoLog?.mood === '' || demoLog?.mood === undefined ? 2 + ((preparationWeek + dayIndex) % 4) : Number(demoLog.mood);
      const fatigue = demoLog?.fatigue === '' || demoLog?.fatigue === undefined ? 3 + ((preparationWeek + dayIndex * 2) % 5) : Number(demoLog.fatigue);
      const soreness = demoLog?.soreness === '' || demoLog?.soreness === undefined ? 2 + ((preparationWeek + dayIndex) % 5) : Number(demoLog.soreness);
      const sleep = demoLog?.sleep === '' || demoLog?.sleep === undefined ? 2 + ((preparationWeek + dayIndex * 3) % 4) : Number(demoLog.sleep);
      const stress = demoLog?.stress === '' || demoLog?.stress === undefined ? 2 + ((preparationWeek * 2 + dayIndex) % 5) : Number(demoLog.stress);
      const wellbeingTotal = mood + fatigue + soreness + sleep + stress;
      const zoneShares = intensity ? effortShare.hard : effortShare.easy;

      const status = completionStatus === 'completed'
        ? 'Completado'
        : completionStatus === 'partial'
          ? 'A medias'
          : completionStatus === 'missed'
            ? 'No realizado'
            : 'Planificado';

      const [rpeBase, rpeSpread] = rpeRange[type];
      const sampleRpe = completionStatus === 'missed' ? 0 : Math.min(10, rpeBase + jitter(rpeSpread - 1, 3) + (preparationWeek === 12 && competition ? 1 : 0));
      const rpe = demoLog?.rpe ? Number(demoLog.rpe) : sampleRpe;
      const [hrBase, hrSpread] = heartRate[type];
      const sampleHr = completionStatus === 'missed' ? 0 : hrBase + jitter(hrSpread, 5);
      const notesPool = completionStatus === 'missed' ? missedNotes : completionStatus === 'partial' ? partialNotes : sampleNotes[type];
      const sampleNote = competition && completionStatus === 'completed'
        ? `${competition.description}: ${sampleNotes['Competición'][preparationWeek % 2].toLocaleLowerCase('es-ES')}`
        : notesPool[(preparationWeek + dayIndex) % notesPool.length];
      const notes = demoLog?.notes || demoLog?.sensaciones || sampleNote;

      const isCycling = type === 'Bicicleta' || /bicicleta|bici|ciclismo/i.test(type);

      return {
        id: `${preparationWeek}-${day}`,
        preparationWeek,
        phase,
        day,
        date,
        type,
        description: competition?.description || workoutDescriptions[type],
        distance: numberValue(distance),
        minutes: numberValue(minutes),
        speed: demoLog?.speed || (isCycling ? (demoLog?.pace || formatSpeed(minutes, distance)) : ''),
        pace: isCycling ? '' : (demoLog?.pace || formatPace(minutes, distance)),
        averageHr: numberValue(demoLog?.averageHr || sampleHr),
        restingHr: numberValue(demoLog?.restingHr || 48 + ((preparationWeek + dayIndex) % 8)),
        hrv: numberValue(demoLog?.hrv || 52 + ((preparationWeek * 4 + dayIndex * 3) % 24)),
        rpe,
        notes,
        mood,
        fatigue,
        soreness,
        sleep,
        stress,
        wellbeingTotal,
        zones: zoneShares.map((share) => Math.round(minutes * share)),
        status,
        completionStatus,
        isRest,
      };
    });
  });
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

function formatPace(minutes, distance) {
  if (!distance) return '—';
  const totalSeconds = Math.round((minutes / distance) * 60);
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;
}

function formatSpeed(minutes, distance) {
  const m = Number(minutes);
  const d = Number(distance);
  if (!d || !m) return '—';
  return String(Math.round((d / (m / 60)) * 10) / 10);
}

/**
 * Resumen de una semana por intensidad, a partir del historial: Baja (Z1 + Z2), Media (Z3) y Alta (Z4).
 * Solo cuenta los días ya registrados (los futuros quedan fuera). Los km de cada sesión se reparten
 * en proporción a sus minutos por zona. Devuelve [baja, media, alta, total] para km, minutos y %.
 */
export function weekIntensitySummary(history, week) {
  const records = history.filter((record) => record.preparationWeek === week && record.completionStatus !== 'unreported');
  const kilometers = [0, 0, 0];
  const minutes = [0, 0, 0];
  records.forEach((record) => {
    const [z1 = 0, z2 = 0, z3 = 0] = record.zones || [];
    const low = Math.min(z1 + z2, record.minutes);
    const mid = Math.min(z3, record.minutes - low);
    const bands = [low, mid, record.minutes - low - mid];
    bands.forEach((value, index) => {
      minutes[index] += value;
      if (record.minutes) kilometers[index] += record.distance * value / record.minutes;
    });
  });
  const totalMinutes = minutes.reduce((sum, value) => sum + value, 0);
  // La última banda se calcula como resto para que los porcentajes sumen 100.
  const [lowPercent, midPercent] = minutes.map((value) => (totalMinutes ? Math.round(value / totalMinutes * 100) : 0));
  const percent = [lowPercent, midPercent, totalMinutes ? 100 - lowPercent - midPercent : 0];
  return {
    days: records.length,
    kilometers: [...kilometers, kilometers.reduce((sum, value) => sum + value, 0)],
    minutes: [...minutes, totalMinutes],
    percent: [...percent, totalMinutes ? 100 : 0],
  };
}
