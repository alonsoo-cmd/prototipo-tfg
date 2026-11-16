export function calculateSpeed(minutes, distance) {
  const m = Number(minutes);
  const d = Number(distance);
  if (!d || !m) return '';
  return String(Math.round((d / (m / 60)) * 10) / 10);
}

export function calculateTrimps(minutes, averageHr, restingHr, athleteProfile = { fcMax: 200, sex: 'male' }) {
  const duration = Number(minutes);
  const avg = Number(averageHr);
  const rest = Number(restingHr);
  if (!duration || !avg) return '';
  const maxHr = Number(athleteProfile?.fcMax) || 200;
  const k = athleteProfile?.sex === 'female' ? 1.67 : 1.92;
  const restHr = rest || 60;
  if (avg <= restHr) return 0;
  const reserve = Math.max(0, Math.min(1, (avg - restHr) / (maxHr - restHr)));
  return Math.round(duration * reserve * 0.64 * Math.exp(k * reserve));
}

export function getTrimpBadge(trimp) {
  const value = Number(trimp);
  if (!value || value <= 0) return null;
  if (value < 50) {
    return {
      label: 'Carga baja',
      category: 'Recuperación activa',
      tone: 'green',
      description: 'Estímulo suave ideal para regenerar o rodajes cortos sin fatiga residual.',
    };
  }
  if (value < 100) {
    return {
      label: 'Carga moderada',
      category: 'Mantenimiento aeróbico',
      tone: 'blue',
      description: 'Sesión aeróbica estándar que consolida la base sin sobrecargar el organismo.',
    };
  }
  if (value < 160) {
    return {
      label: 'Carga alta',
      category: 'Estímulo clave',
      tone: 'amber',
      description: 'Sesión exigente (series, umbral o tirada larga). Requiere descanso o asimilación posterior.',
    };
  }
  return {
    label: 'Carga muy alta',
    category: 'Sobrecarga / Competición',
    tone: 'red',
    description: 'Estrés fisiológico muy elevado. Es recomendable programar descanso o regenerativo tras esta sesión.',
  };
}

export function numberFrom(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function logKey(week, day) {
  return `${week}-${day}`;
}
