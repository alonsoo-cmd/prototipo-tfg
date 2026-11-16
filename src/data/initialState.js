import { sessions } from './sessions.js';
import { phaseForWeek } from './phases.js';
import { sessionDayFields } from '../domain/calendar.js';

// Datos de partida del prototipo. No se persisten: se regeneran en cada carga.

export const PREPARATION_WEEKS = 12;

/** Cuenta con la que se usa el prototipo (la misma persona en los tres roles). */
export const currentUser = { name: 'Alex Martín', firstName: 'Alex', initials: 'AM' };

export const initialAthleteProfile = {
  // FC máxima y sexo alimentan el cálculo del TRIMP (fórmula de Banister).
  fcMax: 200,
  // 'male' | 'female' | null (sin especificar: el TRIMP usa k = 1,92 por defecto).
  sex: null,
  // Umbrales de lactato: ritmo en segundos por km y FC en ppm.
  lt1: { paceSeconds: 240, hr: 180 },
  lt2: { paceSeconds: 225, hr: 190 },
  // Velocidad aeróbica máxima: se alcanza a la FC máxima.
  vam: { paceSeconds: 180 },
  // Repetición máxima (RM) por ejercicio, en kg.
  maxLifts: [
    { id: 'half-squat', name: 'Media sentadilla', kg: 150 },
    { id: 'bulgarian-split-squat', name: 'Sentadilla búlgara', kg: 95 },
  ],
};

/** Experiencia del entrenador: descripción (máx. 500 caracteres) y hasta 5 títulos (nombre + año). */
export const initialCoachExperience = {
  description: 'Planifico por bloques y ajusto la carga cada semana según el diario y el bienestar de cada atleta. Doy prioridad a la constancia y al trabajo de fuerza para prevenir lesiones.',
  titles: [
    { id: 'title-1', name: 'Grado en Ciencias de la Actividad Física y del Deporte', year: 2020 },
    { id: 'title-2', name: 'Entrenador Nacional de Atletismo', year: 2022 },
  ],
};

export const initialPreparations = [{
  id: 1,
  athleteId: 'alex',
  athleteName: 'Alex Martín',
  name: 'Preparación de otoño',
  duration: '12 semanas',
  coach: 'Elena Santos', // del directorio de entrenadores; Lucía Fernández es atleta de Alex
  objectives: [{ id: 11, name: 'Media Maratón Madrid', distance: 'Media maratón', eventDate: '2026-12-06' }],
}];

/** Plan del entrenador: 12 semanas con su fase y una copia de la semana modelo. */
export function createInitialCoachWeeks() {
  return Array.from({ length: PREPARATION_WEEKS }, (_, index) => ({
    number: index + 1,
    phase: phaseForWeek(index + 1),
    days: sessions.map((session, dayIndex) => ({ ...session, ...sessionDayFields(index + 1, dayIndex) })),
  }));
}
