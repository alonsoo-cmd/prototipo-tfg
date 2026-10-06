import { useState } from 'react';
import Metric from '../ui/Metric.jsx';

export default function ActivityForm({connected,setConnected,uploaded,setUploaded,comments,comment,setComment,addComment}){const [preview,setPreview]=useState(null);return <>
    <div className="eyebrow">REGISTRO DE ACTIVIDAD · EJEMPLO</div>
    <h2>Miércoles · Test Lactato</h2>
    <div className="strava-box">
    <div className="strava-mark">S</div>
    <div>
    <b>Strava</b>
    <small>{connected?'Conectado · conexión de demostración':'Sin conectar · demostración'}</small>
    </div>
    <button className="button strava-brand-button" onClick={()=>setConnected(!connected)}>{connected?'Desconectar':'Conectar con Strava'}</button>
    </div>
    <div className="imported-data">
    <div className="panel-title">
    <div>
    <h3>Datos de actividad</h3>
    <p>Valores de ejemplo importados</p>
    </div>
    <span className="example-tag">DEMO</span>
    </div>
    <div className="detail-metrics">{[['Distancia','9,6 km'],['Tiempo','58:14'],['Ritmo medio','6:04 /km'],['FC media','154 ppm'],['Desnivel','42 m']].map(([l,v])=>
    <Metric key={l} label={l} value={v}/>
    )}</div>
    </div>
    <div className="section-block">
    <h3>Series</h3>
    <table className="interval-table">
    <thead>
    <tr>
    <th>#</th>
    <th>Distancia</th>
    <th>Tiempo</th>
    <th>Ritmo</th>
    <th>Recuperación</th>
    </tr>
    </thead>
    <tbody>{[['1','1.000 m','4:12','4:12/km','2:00'],['2','1.000 m','4:10','4:10/km','2:00'],['3','1.000 m','4:14','4:14/km','—']].map(row=>
    <tr key={row[0]}>{row.map(x=>
    <td key={x}>
    <input defaultValue={x}/>
    
    </td>)}</tr>)}</tbody>
    </table>
    <button className="text-button" onClick={e=>e.currentTarget.insertAdjacentHTML('beforebegin','<p class="help-text">Nueva fila de serie añadida al formulario.</p>')}>+ Añadir serie</button>
    </div>
    <div className="section-block ai-upload">
    <div>
    <h3>Extraer series de una imagen</h3>
    <p>Sube una foto de la tabla. El resultado requiere revisión antes de guardarlo.</p>
    </div>
    <label className="button secondary upload-btn">{uploaded?'Imagen seleccionada ✓':'↑ Seleccionar imagen'}<input type="file" accept="image/*" onChange={e=>{const file=e.target.files?.[0];if(file){setPreview(URL.createObjectURL(file));setUploaded(true)}}}/>
    
    </label>
    </div>{uploaded&&<div className="ai-review">
    <div className="image-placeholder">{preview?<img className="upload-preview" src={preview} alt="Imagen de series cargada"/>
    :'Vista previa de la imagen'}</div>
    <div>
    <div className="eyebrow">BORRADOR EXTRAÍDO · REVISAR</div>
    <p>La extracción de IA es una simulación. Revisa los datos antes de guardarlos.</p>
    <table className="interval-table">
    <thead>
    <tr>
    <th>Serie</th>
    <th>Distancia</th>
    <th>Tiempo</th>
    <th>Recuperación</th>
    </tr>
    </thead>
    <tbody>
    <tr>
    <td>
    <input defaultValue="1"/>
    
    </td>
    <td>
    <input defaultValue="1.000 m"/>
    
    </td>
    <td>
    <input defaultValue="4:12"/>
    
    </td>
    <td>
    <input defaultValue="2:00"/>
    
    </td>
    </tr>
    </tbody>
    </table>
    <button className="button secondary">Revisado · guardar en actividad</button>
    </div>
    </div>}<div className="section-block">
    <h3>Comentarios</h3>{comments.map((c,i)=>
    <p className="comment" key={i}>{c}</p>)}<div className="comment-entry">
    <input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Escribe un comentario sobre la actividad…"/>
    
    <button className="button secondary" onClick={addComment}>Añadir comentario</button>
    </div>
    </div>
    <div className="inline-actions">
    <button className="button secondary">Cancelar</button>
    <button className="button primary">Guardar actividad</button>
    </div>
    </>
    }
