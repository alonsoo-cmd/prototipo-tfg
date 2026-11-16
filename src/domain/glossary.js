// Mini glosario: explicaciones breves y en lenguaje llano de los términos técnicos.
// Lo usan los iconos ⓘ (InfoTip) y el glosario del Perfil.

export const glossary = {
  fcMaxPercent: {
    term: '% de la FC máxima',
    text: 'FC media de la actividad dividida entre tu FC máxima (la que tienes en el perfil). Es solo informativo: cuanto más alto, más intensa ha sido la sesión. El color va del verde (suave) al rojo (muy intensa) según las zonas de FC: Z1 50-60 %, Z2 60-70 %, Z3 70-80 %, Z4 80-90 % y Z5 más del 90 %.',
  },
  wt: {
    term: 'WT · Bienestar total',
    text: 'Suma de los cinco indicadores de bienestar del día (irritabilidad, fatiga, agujetas, mal descanso y estrés). Va de 5 a 50: cuanto más bajo, mejor estás.',
  },
  rpe: {
    term: 'RPE · Esfuerzo percibido',
    text: 'Lo duro que te ha parecido el entrenamiento, del 1 (muy suave) al 10 (esfuerzo máximo).',
  },
  fcMedia: {
    term: 'FC media',
    text: 'Pulsaciones medias durante el entrenamiento. Con tu FC máxima se calcula el % de la FC máxima de la sesión.',
  },
  fcReposo: {
    term: 'FC en reposo',
    text: 'Tus pulsaciones en reposo, mejor medidas al despertar. Si suben varios días seguidos, puede ser señal de cansancio o de que estás incubando algo.',
  },
  hrv: {
    term: 'HRV · Variabilidad cardiaca',
    text: 'Pequeñas variaciones de tiempo entre latidos, en milisegundos. Suele medirla el reloj por la noche. Si baja mucho respecto a lo habitual, puede indicar cansancio.',
  },
  ritmo: {
    term: 'Ritmo (min/km)',
    text: 'Minutos que tardas en recorrer un kilómetro. Cuanto más bajo, más rápido vas.',
  },
  umbrales: {
    term: 'Umbrales LT1 y LT2',
    text: 'Marcan las zonas de intensidad. Hasta LT1: ritmo cómodo, puedes hablar. Entre LT1 y LT2: exigente pero sostenible. Por encima de LT2: muy intenso, solo se aguanta poco tiempo.',
  },
  fases: {
    term: 'Fases (BI, BII, BIII)',
    text: 'La preparación se divide en bloques: BI Base (volumen suave), BII Acumulación y Transformación (más carga y calidad), BIII Realización (afinar para la carrera) y Competición.',
  },
};

/** Detecta qué término del glosario corresponde a una etiqueta visible. */
export function glossaryKeyFor(label) {
  if (typeof label !== 'string') return null;
  if (/% FC máx|FC máxima/i.test(label)) return 'fcMaxPercent';
  if (/\bWT\b/.test(label)) return 'wt';
  if (/\bRPE\b|^Esfuerzo$/i.test(label)) return 'rpe';
  if (/FC en reposo|\bFCR\b/i.test(label)) return 'fcReposo';
  if (/FC media/i.test(label)) return 'fcMedia';
  if (/\bHRV\b/.test(label)) return 'hrv';
  if (/^Ritmo/i.test(label)) return 'ritmo';
  return null;
}
