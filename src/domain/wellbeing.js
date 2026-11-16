// Indicadores de bienestar diario. Todos se formulan en NEGATIVO para que la escala
// vaya siempre en el mismo sentido: 1 = lo mejor (verde) y 10 = lo peor (rojo).
// Así el total WT (suma de los cinco, de 5 a 50) también se lee igual: cuanto más bajo, mejor.

export const wellbeingScales = [
  { key: 'mood', label: 'Irritabilidad', low: 'Nada irritable', high: 'Muy irritable' },
  { key: 'fatigue', label: 'Fatiga', low: 'Sin fatiga', high: 'Agotado' },
  { key: 'soreness', label: 'Agujetas', low: 'Sin agujetas', high: 'Muchas agujetas' },
  { key: 'sleep', label: 'Mal descanso', low: 'Dormí muy bien', high: 'Dormí fatal' },
  { key: 'stress', label: 'Estrés', low: 'Sin estrés', high: 'Muy estresado' },
];

/** Formato [clave, etiqueta] que usan formularios, tablas y medias. */
export const wellbeingFields = wellbeingScales.map(({ key, label }) => [key, label]);

export function wellbeingLabel(key) {
  return wellbeingScales.find((scale) => scale.key === key)?.label || key;
}

export const injuryRegions = [
  { id: 'rodilla-derecha', label: 'Rodilla derecha' },
  { id: 'rodilla-izquierda', label: 'Rodilla izquierda' },
  { id: 'cuadriceps-derecho', label: 'Cuádriceps derecho' },
  { id: 'cuadriceps-izquierdo', label: 'Cuádriceps izquierdo' },
  { id: 'tibial-anterior-derecho', label: 'Tibial anterior derecho' },
  { id: 'tibial-anterior-izquierdo', label: 'Tibial anterior izquierdo' },
  { id: 'tibial-posterior-derecho', label: 'Tibial posterior derecho' },
  { id: 'tibial-posterior-izquierdo', label: 'Tibial posterior izquierdo' },
  { id: 'isquiotibial-izquierdo', label: 'Isquiotibial izquierdo' },
  { id: 'isquiotibial-derecho', label: 'Isquiotibial derecho' },
  { id: 'gluteo', label: 'Glúteo' },
  { id: 'tobillo-izquierdo', label: 'Tobillo izquierdo' },
  { id: 'tobillo-derecho', label: 'Tobillo derecho' },
  { id: 'aductores-izquierdo', label: 'Aductores izquierdo' },
  { id: 'aductores-derecho', label: 'Aductores derecho' },
  { id: 'gemelo-izquierdo', label: 'Gemelo izquierdo' },
  { id: 'gemelo-derecho', label: 'Gemelo derecho' },
  { id: 'otro', label: 'Otro' },
];
