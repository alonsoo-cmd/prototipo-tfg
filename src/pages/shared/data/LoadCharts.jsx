import { useState } from 'react';
import { PanelHeading } from './DataPanels.jsx';
import { round, sessionFromRecord } from './dataStats.js';
import { format } from '../../../utils/format.js';

function getColorForType(type) {
  if (!type) return '#cbd5e1';
  const t = type.toLowerCase();
  if (t.includes('competición')) return '#9d7aa9';
  if (t.includes('test')) return '#d0a054';
  if (t.includes('rodaje')) return '#78a487';
  if (t.includes('bicicleta') || t.includes('bici') || t.includes('ciclismo')) return '#319785';
  if (t.includes('series') || t.includes('cambio') || t.includes('cuesta')) return '#6892ad';
  if (t.includes('tirada') || t.includes('long')) return '#bd8b56';
  if (t.includes('fuerza') || t.includes('gym')) return '#6c7fa4';
  return '#8e9ca5';
}

export function InternalLoadChart({ data, onSession }) {
  const [hoveredDay, setHoveredDay] = useState(null);
  const width = 1200;
  const height = 400;
  const padding = { top: 30, right: 20, bottom: 30, left: 40 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const dx = plotWidth / Math.max(1, data.length);
  const barWidth = Math.max(4, dx * 0.6);

  const maxWT = 50;
  const maxLine = 120;
  const minLine = 30;

  const points = data.map((d, i) => {
    const x = padding.left + i * dx + dx / 2;
    const yWT = padding.top + plotHeight - ((d.wellbeingTotal || 0) / maxWT) * plotHeight;
    const yHrv = d.hrv ? padding.top + plotHeight - ((d.hrv - minLine) / (maxLine - minLine)) * plotHeight : null;
    const yFcr = d.restingHr ? padding.top + plotHeight - ((d.restingHr - minLine) / (maxLine - minLine)) * plotHeight : null;
    
    let barColor = '#e2e8f0';
    if (d.records?.length > 0) {
      const type = d.records.find(r => r.type && r.type !== 'Descanso')?.type;
      barColor = getColorForType(type);
    } else if (d.wellbeingTotal) {
      barColor = '#cbd5e1';
    }
    
    return { ...d, x, yWT, yHrv, yFcr, barColor };
  });

  const hrvPath = points.filter(p => p.yHrv !== null).map((p, i) => `${i===0?'M':'L'} ${p.x} ${p.yHrv}`).join(' ');
  const fcrPath = points.filter(p => p.yFcr !== null).map((p, i) => `${i===0?'M':'L'} ${p.x} ${p.yFcr}`).join(' ');

  return (
    <section className="panel chart-card internal-load-chart">
      <PanelHeading title="Carga Interna (Mensual)" description="Respuesta fisiológica y subjetiva al entrenamiento" />
      <div className="chart-scroll" style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="line-chart" style={{ minWidth: `${width}px` }}>
          {[0, 0.25, 0.5, 0.75, 1].map(pct => {
             const y = padding.top + plotHeight * pct;
             return <g key={pct}>
               <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} className="chart-gridline" />
               <text x={padding.left - 8} y={y + 3} textAnchor="end" className="chart-y-label">{Math.round(maxWT - pct * maxWT)}</text>
             </g>
          })}
          
          {points.map((p, i) => p.wellbeingTotal ? (
            <rect key={`bar-${i}`} x={p.x - barWidth/2} y={p.yWT} width={barWidth} height={Math.max(0, padding.top + plotHeight - p.yWT)} fill={p.barColor} rx={3} opacity={0.85} />
          ) : null)}

          {hrvPath && <path d={hrvPath} fill="none" stroke="#618eb1" strokeWidth="2.5" strokeLinejoin="round" />}
          {fcrPath && <path d={fcrPath} fill="none" stroke="#73a681" strokeWidth="2.5" strokeLinejoin="round" />}
          
          {points.map((p, i) => p.yHrv !== null && <circle key={`hrv-${i}`} cx={p.x} cy={p.yHrv} r={4} fill="#618eb1" stroke="#fff" strokeWidth="1.5" />)}
          {points.map((p, i) => p.yFcr !== null && <circle key={`fcr-${i}`} cx={p.x} cy={p.yFcr} r={4} fill="#73a681" stroke="#fff" strokeWidth="1.5" />)}

          {points.map((p, i) => (
             <rect key={`interact-${i}`} x={padding.left + i * dx} y={padding.top} width={dx} height={plotHeight} fill="transparent" 
                onMouseEnter={() => setHoveredDay(p)} 
                onMouseLeave={() => setHoveredDay(null)}
                onClick={() => p.records?.[0] && onSession && onSession(sessionFromRecord(p.records[0]))}
                style={{ cursor: p.records?.length ? 'pointer' : 'default' }}
             />
          ))}
          
          {points.map((p, i) => p.records?.some(r => r.type === 'Competición' || r.type?.includes('Test')) ? (
             <text key={`label-${i}`} x={p.x} y={p.yWT - 8} textAnchor="middle" fontSize={12} fill={p.barColor} fontWeight="700">
               {p.records.find(r => r.type === 'Competición' || r.type?.includes('Test')).type}
             </text>
          ) : null)}
          
          {points.map((p, i) => i % Math.max(1, Math.floor(points.length / 10)) === 0 || i === points.length - 1 ? (
             <text key={`x-${i}`} x={p.x} y={height - 10} textAnchor="middle" className="chart-axis-label">{p.date.slice(-2)}</text>
          ) : null)}
        </svg>

        {hoveredDay && hoveredDay.records?.length > 0 && (
          <div className="chart-tooltip" style={{
            position: 'absolute',
            left: Math.min(hoveredDay.x, width - 180),
            top: 20,
            background: '#1b2c3a',
            color: '#fff',
            padding: '10px 14px',
            borderRadius: 8,
            pointerEvents: 'none',
            fontSize: 'var(--text-sm)',
            zIndex: 10,
            width: 170,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <b style={{ display: 'block', color: '#99a3ac', marginBottom: 6, fontSize: 'var(--text-xs)' }}>{hoveredDay.date}</b>
            {hoveredDay.records.map((r, i) => (
              <div key={i} style={{ marginBottom: i < hoveredDay.records.length - 1 ? 8 : 0 }}>
                <strong style={{ display: 'block', color: getColorForType(r.type), marginBottom: 2 }}>{r.type || 'Entrenamiento'}</strong>
                <span style={{ fontSize: 'var(--text-xs)', color: '#e2e8f0' }}>{r.distance ? `${format(r.distance)} km · ` : ''}{r.minutes ? `${r.minutes} min` : ''}</span>
              </div>
            ))}
            {hoveredDay.wellbeingTotal > 0 && <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #3b4c5a', fontSize: 'var(--text-xs)', color: '#cbd5e1' }}>
              WT: <b>{Math.round(hoveredDay.wellbeingTotal)}</b> · HRV: <b>{Math.round(hoveredDay.hrv)}</b> · FCR: <b>{Math.round(hoveredDay.restingHr || 0)}</b>
            </div>}
            <div style={{ marginTop: 8, color: '#8fb4d3', fontSize: 'var(--text-xs)', fontWeight: 500 }}>Clic para ver detalles ↗</div>
          </div>
        )}
      </div>
      <div className="chart-legend">
        <span><i style={{ background: '#78a487' }} />Rodaje</span>
        <span><i style={{ background: '#319785' }} />Bicicleta</span>
        <span><i style={{ background: '#6892ad' }} />Series/Intensidad</span>
        <span><i style={{ background: '#9d7aa9' }} />Competición</span>
        <span><i style={{ background: '#618eb1', borderRadius: '50%' }} />HRV</span>
        <span><i style={{ background: '#73a681', borderRadius: '50%' }} />FCR</span>
      </div>
    </section>
  );
}

export function ExternalLoadChart({ data }) {
  const [hoveredDay, setHoveredDay] = useState(null);
  const width = 1200;
  const height = 400;
  const padding = { top: 20, right: 40, bottom: 30, left: 40 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const pointsData = data;
  const dx = plotWidth / Math.max(1, pointsData.length - 1);

  // Use dynamic max for normalization to overlap lines
  const maxKm = Math.max(1, ...pointsData.map(d => d.rollingDistance || 0));
  const maxMin = Math.max(1, ...pointsData.map(d => d.rollingMinutes || 0));
  const maxTrimp = Math.max(1, ...pointsData.map(d => d.rollingTrimps || 0));

  const points = pointsData.map((d, i) => {
    const x = padding.left + i * dx;
    // Overlap them in the same area, scaling relative to their own maximums
    const yKm = padding.top + plotHeight - ((d.rollingDistance || 0) / maxKm) * plotHeight;
    const yMin = padding.top + plotHeight - ((d.rollingMinutes || 0) / maxMin) * plotHeight;
    const yTrimp = padding.top + plotHeight - ((d.rollingTrimps || 0) / maxTrimp) * plotHeight;
    return { ...d, x, yKm, yMin, yTrimp };
  });

  const kmPath = points.map((p, i) => `${i===0?'M':'L'} ${p.x} ${p.yKm}`).join(' ');
  const kmAreaPath = points.length ? `${kmPath} L ${points.at(-1).x} ${padding.top + plotHeight} L ${points[0].x} ${padding.top + plotHeight} Z` : '';
  const minPath = points.map((p, i) => `${i===0?'M':'L'} ${p.x} ${p.yMin}`).join(' ');
  const trimpPath = points.map((p, i) => `${i===0?'M':'L'} ${p.x} ${p.yTrimp}`).join(' ');

  return (
    <section className="panel chart-card external-load-chart">
      <PanelHeading title="Carga Externa Acumulada (Mensual)" description="Evolución superpuesta para ver eficiencia (divergencia entre volumen y tiempo)" />
      <div className="chart-scroll" style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="line-chart" style={{ minWidth: `${width}px` }}>
           <defs>
             <linearGradient id="kmGradient" x1="0" y1="0" x2="0" y2="1">
               <stop offset="0%" stopColor="#4c88ad" stopOpacity="0.25" />
               <stop offset="100%" stopColor="#4c88ad" stopOpacity="0" />
             </linearGradient>
           </defs>
           {[0, 0.25, 0.5, 0.75, 1].map(pct => {
             const y = padding.top + plotHeight * pct;
             return <g key={pct}>
               <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} className="chart-gridline" />
               <text x={padding.left - 8} y={y + 4} textAnchor="end" className="chart-y-label" fill="#4c88ad" fontWeight="bold">{Math.round(maxKm - pct * maxKm)}</text>
               <text x={width - padding.right + 8} y={y + 4} textAnchor="start" className="chart-y-label" fill="#70a582" fontWeight="bold">{Math.round(maxMin - pct * maxMin)}</text>
             </g>
           })}

           {kmAreaPath && <path d={kmAreaPath} fill="url(#kmGradient)" />}

           <path d={kmPath} fill="none" stroke="#4c88ad" strokeWidth="3" strokeLinejoin="round" />
           <path d={minPath} fill="none" stroke="#70a582" strokeWidth="2.5" strokeDasharray="6 6" strokeLinecap="round" strokeLinejoin="round" />
           <path d={trimpPath} fill="none" stroke="#bd8b56" strokeWidth="2" strokeDasharray="2 4" strokeLinecap="round" strokeLinejoin="round" />
           
           {points.map((p, i) => <circle key={`km-${i}`} cx={p.x} cy={p.yKm} r={4} fill="#4c88ad" stroke="#fff" strokeWidth="1.5" />)}
           
           {points.map((p, i) => (
             <rect key={`interact-${i}`} x={Math.max(0, p.x - dx/2)} y={padding.top} width={dx} height={plotHeight} fill="transparent" 
                onMouseEnter={() => setHoveredDay(p)} 
                onMouseLeave={() => setHoveredDay(null)}
             />
           ))}

           {points.map((p, i) => i % Math.max(1, Math.floor(points.length / 10)) === 0 || i === points.length - 1 ? (
             <text key={`x-${i}`} x={p.x} y={height - 10} textAnchor="middle" className="chart-axis-label">{p.date.slice(-2)}</text>
          ) : null)}
        </svg>

        {hoveredDay && (
          <div className="chart-tooltip" style={{
            position: 'absolute',
            left: Math.min(hoveredDay.x, width - 140),
            top: 20,
            background: '#1b2c3a',
            color: '#fff',
            padding: '10px 14px',
            borderRadius: 8,
            pointerEvents: 'none',
            fontSize: 'var(--text-sm)',
            zIndex: 10,
            width: 130,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <b style={{ display: 'block', color: '#99a3ac', marginBottom: 6, fontSize: 'var(--text-xs)' }}>{hoveredDay.date} (Últ. 7d)</b>
            <div style={{ marginBottom: 4 }}><strong style={{ color: '#4c88ad' }}>{hoveredDay.rollingDistance}</strong> km</div>
            <div style={{ marginBottom: 4 }}><strong style={{ color: '#70a582' }}>{hoveredDay.rollingMinutes}</strong> min</div>
            <div><strong style={{ color: '#bd8b56' }}>{hoveredDay.rollingTrimps}</strong> TRIMPS</div>
          </div>
        )}
      </div>
      <div className="chart-legend">
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <i style={{ background: 'linear-gradient(to bottom, rgba(76,136,173,0.5), transparent)', borderTop: '3px solid #4c88ad', height: 8, width: 12, marginRight: 6, display: 'inline-block', borderRadius: 0 }} />
          Kilómetros (max {Math.round(maxKm)})
        </span>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <i style={{ borderBottom: '2.5px dashed #70a582', height: 0, width: 14, marginRight: 6, display: 'inline-block', borderRadius: 0, background: 'transparent' }} />
          Minutos (max {Math.round(maxMin)})
        </span>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <i style={{ borderBottom: '2px dotted #bd8b56', height: 0, width: 14, marginRight: 6, display: 'inline-block', borderRadius: 0, background: 'transparent' }} />
          TRIMPS (max {Math.round(maxTrimp)})
        </span>
      </div>
    </section>
  );
}
