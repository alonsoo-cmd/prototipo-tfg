// Porcentaje de la FC máxima: dato informativo de cada actividad.
// % FC máx = FC media de la actividad / FC máxima del perfil del atleta × 100.

/** Zonas clásicas de 5 zonas por % de FC máxima. */
export const hrZones = [
  { id: 'Z1', from: 50, to: 60, label: 'Recuperación' },
  { id: 'Z2', from: 60, to: 70, label: 'Aeróbico suave' },
  { id: 'Z3', from: 70, to: 80, label: 'Aeróbico intenso' },
  { id: 'Z4', from: 80, to: 90, label: 'Umbral' },
  { id: 'Z5', from: 90, to: 101, label: 'Máximo' },
];

/** % de FC máxima redondeado, o null si falta algún dato. */
export function hrPercent(averageHr, fcMax) {
  const avg = Number(averageHr);
  const max = Number(fcMax);
  if (!avg || !max) return null;
  return Math.round((avg / max) * 100);
}

/** Zona correspondiente al porcentaje (por debajo del 50 % se considera muy suave). */
export function hrZone(percent) {
  if (percent === null || percent === undefined) return null;
  if (percent < 50) return { id: 'Z0', label: 'Muy suave' };
  return hrZones.find((zone) => percent >= zone.from && percent < zone.to) || hrZones.at(-1);
}

// Gradiente continuo anclado a las zonas: verde (bajo) → amarillo → naranja → rojo (alto).
// Pares [porcentaje, tono HSL].
const hueStops = [[50, 135], [60, 100], [70, 52], [80, 32], [90, 8], [100, 0]];

/** Tono HSL (0 = rojo, 135 = verde) para un porcentaje, interpolado entre anclas. */
export function hrHue(percent) {
  if (percent <= hueStops[0][0]) return hueStops[0][1];
  for (let i = 1; i < hueStops.length; i += 1) {
    const [toPct, toHue] = hueStops[i];
    const [fromPct, fromHue] = hueStops[i - 1];
    if (percent <= toPct) return fromHue + ((percent - fromPct) / (toPct - fromPct)) * (toHue - fromHue);
  }
  return hueStops.at(-1)[1];
}

/** Colores de texto y fondo (contraste suficiente sobre blanco) para el porcentaje. */
export function hrColors(percent) {
  const hue = Math.round(hrHue(percent));
  return { color: `hsl(${hue} 70% 32%)`, background: `hsl(${hue} 80% 92%)`, solid: `hsl(${hue} 72% 45%)` };
}
