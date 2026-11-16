import { hrColors, hrPercent, hrZone } from '../../domain/heartRate.js';

/**
 * % de la FC máxima de una actividad, coloreado de verde (bajo) a rojo (alto).
 * Solo informativo. Si falta la FC media, muestra «—».
 * `showZone` añade la zona (p. ej. «Z4 · Umbral»).
 */
export default function HrPercent({ averageHr, fcMax, showZone = false }) {
  const percent = hrPercent(averageHr, fcMax);
  if (percent === null) return <span className="hr-percent empty" title="Sin FC media registrada">—</span>;
  const zone = hrZone(percent);
  const { color, background } = hrColors(percent);
  return <span className="hr-percent" style={{ color, background }} title={`${averageHr} ppm de ${fcMax} ppm · ${zone.id} · ${zone.label}`}>
    {percent} %{showZone && <small> · {zone.id} {zone.label}</small>}
  </span>;
}
