export default function Wellness({title,value,setValue,kind}){const label=kind==='sleep'?(value>=8?'Alto':value>=5?'Medio':'Bajo'):kind==='soreness'?(value<=3?'Bajo':value<=6?'Medio':'Alto'):kind==='mood'?(value>=7?'Buen humor':value>=4?'Intermedio':'Bajo'):kind==='fatigue'?(value<=3?'Baja':value<=6?'Media':'Alta'):(value<=3?'Bajo':value<=6?'Medio':'Alto');return <div className="wellness-card">
    <div className="wellness-top">
    <b>{title}</b>
    <span className={`wellness-value ${kind}`}>{value} <small>{label}</small>
    </span>
    </div>
    <div className="scale" role="group" aria-label={`${title}, valor ${value} de 10`}>{Array.from({length:10},(_,i)=>
    <button key={i} className={`${kind} ${i<value?'filled':''}`} onClick={()=>setValue(i+1)} aria-label={`${i+1} de 10`}/>
    )}</div>
    <small className="scale-caption">
    <span>1</span>
    <span>Registrar valor · 1–10</span>
    <span>10</span>
    </small>
    </div>}
