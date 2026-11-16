export function calculateSpeed(minutes, distance) {
  const m = Number(minutes);
  const d = Number(distance);
  if (!d || !m) return '';
  return String(Math.round((d / (m / 60)) * 10) / 10);
}

/** Texto del perfil para el sexo registrado. */
export function sexLabel(sex) {
  return sex === 'female' ? 'Mujer' : sex === 'male' ? 'Hombre' : 'No especificado';
}

export function numberFrom(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function logKey(week, day) {
  return `${week}-${day}`;
}
