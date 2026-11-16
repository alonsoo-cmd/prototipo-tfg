# Plan de implementación — Edurance (prototipo TFG)

- **Fecha de la revisión:** 16 de noviembre de 2026
- **Alcance:** corrección de fallos + rediseño visual (minimalista, sin aspecto de "web generada por IA")
- **Estado del código revisado:** rama `main` con cambios sin confirmar (ver Fase 0). Los números de línea se refieren a ese estado y pueden moverse.

## Cómo leer este plan

- Las fases van en orden. Cada una se puede fusionar por separado.
- Esfuerzo: **S** (menos de 1 h), **M** (1-3 h), **L** (más de 3 h). Son estimaciones.
- Cada tarea indica el archivo y cómo comprobar que está hecha.
- Marca `[x]` según avances.

## Decisiones (✅ aprobadas el 16 nov 2026: todas según la propuesta)

| # | Decisión | Decidido | Afecta a |
|---|---|---|---|
| D1 | Calendario de la preparación | Inicio el **lunes 14 sep 2026**. Así la semana 12 es 30 nov – 6 dic y termina el día de la Media Maratón. | 1.2 |
| D2 | "Hoy" del prototipo | Fecha fija de demostración (**4 nov 2026**, semana 8), no la fecha real. Los datos son estáticos y así la demo no cambia según el día. | 1.2 |
| D3 | Página "Buscar entrenador" | Darle una entrada visible (ahora no se puede llegar a ella). La alternativa es borrarla. | 1.6 |
| D4 | Color de acento único | **Lima** (ya es el del logo y el menú). El azul de los botones desaparece. | 4.1 |
| D5 | Tipografía | Una sola sans (DM Sans) + **JetBrains Mono** para cifras. Se elimina Manrope. | 4.2 |
| D6 | Navegación con URL (`#/diario`) | Hacerlo: ahora recargar devuelve siempre a Inicio y el botón "atrás" no funciona. | 2.5 |

---

## Fase 0 — Asegurar el trabajo actual (S) · HACER PRIMERO

**Problema:** hay unos 20 archivos modificados y unas 20 rutas nuevas sin confirmar en `main` (entre ellas `src/state/`, `src/domain/`, `src/routes/AppRoutes.jsx` y `src/components/journal/`). Si se pierde el disco, se pierde esa parte. Además, cada `push` a `main` despliega en AWS.

> **Actualización 16 nov:** el estado ya se confirmó y subió en `cbb2e74 "Actualización"`, que además incluyó ~35 archivos de `.playwright-mcp/`.

- [x] 0.1 Añadir `.playwright-mcp/` a `.gitignore` y sacarla del repositorio con `git rm -r --cached .playwright-mcp`.
- [x] 0.2 ~~Confirmar el estado actual en un commit propio~~: ya hecho en `cbb2e74`.
- [x] 0.3 Crear la rama `rediseno` y trabajar ahí. No se despliega nada hasta fusionar en `main`.

**Comprobación:** `git status` limpio y `git branch --show-current` devuelve `rediseno`.

---

## Fase 1 — Fallos funcionales y de datos

### 1.1 El scroll no vuelve arriba al cambiar de página (S)
- **Visto:** tras bajar en Inicio y pulsar Diario, la página abre con el título cortado (`scrollY` se queda en 145).
- **Archivo:** `src/routes/App.jsx`.
- **Cambio:** `useEffect(() => window.scrollTo(0, 0), [page, role])`.
- [x] Hecho · **Comprobación:** bajar en cualquier página, navegar y ver el título completo.

### 1.2 Fechas incoherentes: hay cinco calendarios distintos (M)
- **Visto:**
  - Inicio y Diario dicen "Lunes 21 oct", pero el 21 oct 2026 es miércoles.
  - En Datos, la cabecera "Semana 12 · 18 — 24 nov" contiene filas del 9 al 15 nov.
  - El modal del diario dice "Lunes 16 nov" (fecha real) para el entreno que Inicio sitúa el 21 oct.
  - La preparación acaba el 24 nov y la carrera objetivo es el 6 dic.
- **Origen:** cada archivo calcula las fechas con su propia fecha base.

| Archivo | Línea | Fecha base |
|---|---|---|
| `src/components/ui/WeekTimeline.jsx` | 24-25 | semana 8 = 21 oct 2026 |
| `src/pages/athlete/Diary.jsx` | 18 | semana 8 = 21 oct 2026 |
| `src/pages/coach/preparation/preparationUtils.js` | 7 | semana 8 = 21 oct 2026 |
| `src/pages/coach/preparation/preparationUtils.js` | 62 | semana 1 = 8 sep **2025** |
| `src/pages/coach/preparation/preparationUtils.js` | 72 | año "2026" escrito a mano |
| `src/data/trainingHistory.js` | 120 | semana 1 = 24 ago 2026 |
| `src/data/groupHistory.js` | 9 | semana 1 = 24 ago 2026 |

- **Cambio:**
  - [ ] Crear `src/domain/calendar.js` con `PREPARATION_START`, `DEMO_TODAY`, `weekMonday(n)`, `weekRange(n)`, `currentWeek()` y `today()` (según D1 y D2).
  - [ ] Sustituir las siete líneas de la tabla por esas funciones.
  - [ ] Sustituir `new Date()` por `today()` en `Dashboard.jsx:46`, `Diary.jsx:125`, `DataPage.jsx:34`, `dataStats.js:80`, `trainingHistory.js:45` y `groupHistory.js:11`. No tocar `DatePicker.jsx` ni `CoachExperienceSection.jsx` (ahí la fecha real es correcta).
  - [ ] Quitar el `8` fijo de `useAppState.js` (`useState(8)`) y de las llamadas `getWeekDateRange(…, 8)` en `DataSection.jsx:134` y `DiaryAveragesModal.jsx:42`.
- **Comprobación:** la semana 12 muestra 30 nov – 6 dic en Inicio, Diario, Datos y Preparaciones, y todos los "Lunes" caen en lunes.

### 1.3 Plantillas con ritmos imposibles (S)
- **Visto:** "Rodaje · 34 min · 11,5 km" (2:57/km), "Tirada larga · 32 min · 14,9 km" (2:09/km), "Cuestas · 52 min · 3,8 km".
- **Origen:** `src/data/workoutTemplates.js:28-32` genera minutos y kilómetros por separado.
- **Cambio:** calcular los km a partir de los minutos y un ritmo por tipo (por ejemplo rodaje 5:00/km, series 4:00/km, bici 2:15/km).
- [ ] Hecho · **Comprobación:** ningún ritmo de carrera por debajo de 3:00/km en Entrenamientos.

### 1.4 Historial de ejemplo poco creíble (M)
- **Visto:** rodaje suave a 166 ppm y series a 149 ppm; todas las semanas 7/7 completadas; mismas notas y mismo RPE cada semana; competición todos los sábados con RPE 10.
- **Archivo:** `src/data/trainingHistory.js`.
- **Cambio:**
  - [ ] FC media según el tipo de sesión (rodaje < umbral < series < competición).
  - [ ] Alguna sesión "a medias" o "no realizada" por semana.
  - [ ] Competición solo en semanas de competición.
  - [ ] Dos o tres notas distintas por tipo.
- **Comprobación:** en Datos, ningún rodaje tiene más FC que unas series de la misma semana.

### 1.5 El editor de plantillas guarda formularios vacíos (S)
- **Visto:** al pulsar "Guardar entrenamiento" sin rellenar nada se crea "Entrenamiento · 0 min · 0 km · 0 TR".
- **Archivo:** `src/components/workouts/WorkoutEditor.jsx` (función `submit`).
- **Cambio:** tipo obligatorio y duración mayor que 0 (salvo Descanso), con mensaje de error como el del bienestar en Inicio.
- [x] Hecho · **Comprobación:** guardar vacío muestra el error y no crea la tarjeta.

### 1.6 "Buscar entrenador" es inaccesible (S-M, según D3)
- **Visto:** `activePlan` empieza en `true` y en todo el código solo existe `setActivePlan(true)` (`Diary.jsx:76`). Nunca se llega a `FindCoach`, ni al formulario de solicitud, ni al aviso de solicitud enviada.
- **Cambio propuesto:** enlace "Buscar entrenador" en Perfil → Preparación, o un interruptor "Sin preparación" en el modo demostración.
- [ ] Hecho · **Comprobación:** se llega a la página con el ratón, se envía una solicitud y aparece el aviso.

### 1.7 Botones que no hacen nada (S)

| Archivo | Línea | Elemento |
|---|---|---|
| `src/components/layout/Sidebar.jsx` | 53 | botón `···` junto al nombre |
| `src/components/layout/Topbar.jsx` | 4 | Notificaciones (muestra un "2") |
| `src/pages/athlete/FindCoach.jsx` | 15-16 | filtros Ubicación y Especialidad |
| `src/pages/athlete/FindCoach.jsx` | — | el buscador por nombre no filtra |
| `src/pages/athlete/FindCoach.jsx` | — | "Ver perfil" abre el formulario de solicitud |
| `src/components/modals/ActivityForm.jsx` | 92, 103, 104 | detectados buscando en el código, sin abrir el modal: revisar |

- **Cambio:** darles función o quitarlos. Un botón muerto en una defensa se nota.
- [ ] Hecho

### 1.8 Panel del entrenador (Atletas) con datos contradictorios (M)
- **Archivo:** `src/pages/coach/CoachHome.jsx`.
- [ ] Las cifras "6 / 6 / 1" están escritas a mano: calcularlas desde `coachAthletes` y `preparations`.
- [ ] Línea 51: "12 DE 12 SEMANAS" usa `weeks.length`. Debe ser "semana actual de total".
- [ ] Lucía Fernández tiene preparación activa y, a la vez, una solicitud "Nueva" para la misma carrera. Cambiar la solicitante por alguien sin preparación.
- [ ] Todas las filas de atleta abren Preparaciones sin seleccionar al atleta pulsado.
- [ ] La tabla de asistencia usa otros nombres (Carlos Díaz, Luis Herrero, Marta Ruiz) que no están en la lista de atletas.
- [ ] La solicitud dice "me gustaría empezar en septiembre" y está fechada en noviembre.

### 1.9 Formato de números mezclado (S)
- **Visto:** "Media: 7.0" junto a "3,5 km"; "11.5 km" en Entrenamientos y "11,5 km" en Preparaciones; "4.5 km" en el resumen práctico.
- **Cambio:** usar siempre `format()` de `src/utils/format.js`.
  - [x] `src/pages/shared/data/DataSection.jsx:129` (`toFixed`)
  - [x] `src/pages/coach/WorkoutsPage.jsx` (métricas de la tarjeta)
  - [x] Resumen práctico de `PreparationPage.jsx`
  - [x] `src/pages/athlete/Diary.jsx:193` (reemplazo manual de punto por coma)
  - [x] Además: `Dashboard.jsx`, `SessionDetailModal.jsx`, `PhasesSummaryModal.jsx`, `LoadCharts.jsx`. `format(valor, 1)` fija un decimal (7 → «7,0»).
- **Comprobación:** buscar `\d\.\d` en pantalla no da resultados en cifras.

### 1.10 Inicio según el rol (S)
- [ ] `Sidebar.jsx`: en el rol entrenador se filtra `Dashboard`, así que no hay forma de volver a Inicio salvo con el selector de demostración.
- [ ] `Dashboard.jsx:67-68`: "Hola, Alex" está escrito a mano (usar el nombre del perfil) y el subtítulo es el mismo para atleta, grupo y entrenador.

### 1.11 Detalles menores (S)
- [ ] `JournalModal.jsx:341`: el TRIMP dice "hombre (k = 1,92)" aunque el perfil pone género "No especificado". Indicar que es el valor por defecto.
- [ ] Preparaciones: "12 semanas · Media maratón · 12 semanas planificadas" repite el dato.
- [ ] Preparaciones: el título habla de "últimos 7 días" y la descripción de "últimas 7 sesiones".

---

## Fase 2 — Modales, móvil y accesibilidad

### 2.1 Cuatro modales no usan `ModalShell` (M)
- **Visto:** el editor de plantillas no tiene `role="dialog"` y no se cierra con Escape.

| Archivo | Línea |
|---|---|
| `src/components/workouts/WorkoutEditor.jsx` | 42 |
| `src/components/modals/DiaryAveragesModal.jsx` | 49 |
| `src/pages/coach/preparation/PreparationModals.jsx` | 11 y 37 |

- [ ] Envolverlos en `ModalShell`. `JournalModal.jsx` ya lo hace bien por su cuenta: se puede dejar o migrar.

### 2.2 `ModalShell` no gestiona el foco (M)
- **Visto:** con "Revisar solicitud" abierto, el foco se queda en el botón de detrás y la página de fondo sigue desplazándose.
- **Archivo:** `src/components/modals/ModalShell.jsx`.
- [ ] Llevar el foco al modal al abrir y devolverlo al cerrar (la lógica ya existe en `JournalModal.jsx:88`).
- [ ] Atrapar el tabulador dentro del modal.
- [ ] Bloquear el scroll del `body` mientras esté abierto.
- [ ] Pasar `labelledBy` desde `AppModals.jsx` (la propiedad existe y no se usa).
- **Comprobación:** abrir un modal con teclado, tabular sin salir de él, Escape y el foco vuelve al botón.

### 2.3 Barra superior en móvil (S)
- **Visto (375 px):** con etiquetas largas ("Preparaciones", "Entrenamientos") la miga de pan se monta sobre el icono de notificaciones.
- **Archivo:** `src/vivid.css` (bloque `@media (max-width: 1024px)`).
- [x] `.breadcrumb { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; }` o mostrar solo el nombre de la página por debajo de 760 px.

### 2.4 Botones demasiado pequeños para el dedo (M)
- **Medido a 375 px (controles de menos de 32 px):** Datos 35 de 40, Preparaciones 61 de 133, Entrenamientos 10 de 24.
- [ ] Altura mínima de 40-44 px en botones, selectores y pestañas por debajo de 760 px.

### 2.5 Navegación sin URL (M, según D6)
- **Visto:** la página activa vive solo en memoria (`useAppState.js`).
- [ ] Sincronizar `page` y `role` con `location.hash`. Con hash no hace falta tocar CloudFront.

### 2.6 `index.html` (S)
- [ ] Añadir favicon y `<meta name="description">`.

**Sin problemas detectados:** no hay desbordamiento horizontal a 375 px en ninguna de las 9 vistas, la consola no muestra errores y la validación del bienestar funciona.

---

## Fase 3 — Sistema de diseño (base del rediseño)

**Medido en el CSS actual:** más de 900 colores hex distintos, 31 degradados, 78 `box-shadow`, 16 radios de borde distintos y solo 6 colores como variable. `styles.css` contiene tres temas verdes sucesivos y `vivid.css` los pisa (`.button.primary` se define 5 veces).

- [ ] 3.1 (S) Pasar Prettier a `styles.css` (está minificado en líneas enormes) y confirmarlo en un commit aparte, sin más cambios.
- [ ] 3.2 (M) Crear `src/styles/tokens.css`:
  - Color: `--ink`, `--ink-soft`, `--bg`, `--surface`, `--line`, `--accent`, `--accent-ink`.
  - Estado: `--ok`, `--warn`, `--bad` (completado, a medias, no realizado).
  - Tipo de sesión: 7 colores, solo para el calendario.
  - Radios: `--r-sm: 6px`, `--r-lg: 12px`, `--r-pill: 999px`.
  - Sombra: una sola, para modal, popover y toast.
- [ ] 3.3 (L) Fusionar las capas de tema: por cada selector repetido, dejar solo el valor final y borrar `vivid.css` cuando quede vacío. Hacerlo componente a componente, comprobando en el navegador.
- [ ] 3.4 (L) Sustituir los hex por variables.
- [ ] 3.5 (S) Dejar dos radios y quitar degradados y sombras decorativas.

**Comprobación (objetivos):**

| Métrica | Ahora | Objetivo |
|---|---|---|
| Colores hex distintos | más de 900 | 25 o menos, todos en `tokens.css` |
| Degradados | 31 | 0 |
| `box-shadow` | 78 | 5 o menos |
| Radios distintos | 16 | 3 |

---

## Fase 4 — Rediseño visual

### 4.1 Un solo acento (M, según D4)
- [ ] Botón principal en tinta (`--ink`) con texto blanco. El azul `#5278df` desaparece.
- [ ] Lima solo para la marca, el elemento activo del menú y un dato destacado por pantalla.
- [ ] Coral solo para avisos (cambios sin guardar, alertas).
- [ ] Quitar los fondos morado (perfil del entrenador), verde y ámbar de los paneles.

### 4.2 Tipografía (M, según D5)
- [ ] Instalar las fuentes con `@fontsource` y quitar el `@import` de Google Fonts de `styles.css` (bloquea el render).
- [ ] Cifras (km, minutos, ritmos, TRIMPS, ppm) en JetBrains Mono con `font-variant-numeric: tabular-nums`.
- [ ] Quitar `Inter` de la lista de fuentes de reserva.

### 4.3 Inicio del atleta (M)
- **Archivo:** `src/pages/shared/Dashboard.jsx`.
- [ ] Quitar las tarjetas Diario / Datos / Atletas (repiten el menú lateral).
- [ ] Usar ese espacio para información real: días hasta el objetivo, km hechos frente a planificados esta semana y última sesión registrada.
- [ ] El círculo de "Entreno de hoy": convertirlo en anillo de progreso semanal o en un bloque normal.
- [ ] No repetir aquí la tabla semanal completa que ya está en Diario: dejar hoy y mañana.

### 4.4 Panel del entrenador (S)
- [ ] Sustituir las tres tarjetas de cifras por una línea de resumen ("6 atletas · 1 solicitud pendiente").
- [ ] Arriba, lo que requiere acción: solicitudes y atletas con sesiones no realizadas.

### 4.5 Iconos (M)
- **Visto:** glifos Unicode (⌂ ▦ ◌ ○ ♧ ▣ ⌕), emojis (👟 ×4, 📓, 📊, 💡, ⚡, ℹ️) y SVG mezclados. El ♧ se usa para Atletas y para Notificaciones.
- [ ] Instalar `lucide-react` y sustituirlos todos. Empezar por `src/routes/navigation.js`.

### 4.6 Rótulos en mayúsculas (S)
- [ ] Quitar los que repiten la miga de pan o el título ("INICIO · ATLETA", "ENTRENADOR · PREPARACIONES", "ENTRENADOR · BIBLIOTECA").
- [ ] Mantener los que aportan un dato ("SEMANA 8 · BII · ACUMULACIÓN").

### 4.7 Jerarquía (M)
- [ ] `h1` de 24 a 28-32 px.
- [ ] Una cifra grande por panel; el resto, secundario.
- [ ] Texto principal a 14-15 px en escritorio. Mantener el mínimo de 12 px.

### 4.8 Biblioteca de entrenamientos (S)
- **Archivo:** `src/pages/coach/WorkoutsPage.jsx`.
- [ ] La tarjeta muestra el tipo dos veces ("RODAJE" y "Rodaje"): añadir un campo `name` a las plantillas o quitar el rótulo.
- [ ] "Eliminar" visible en todas las tarjetas: moverlo al detalle.

### 4.9 Preparaciones (L, opcional)
- **Visto:** la página mide unos 7.000 px de alto en móvil.
- [ ] Dividirla en pestañas: Resumen práctico, Plan semanal y Objetivos.

---

## Fase 5 — Cierre

- [ ] 5.1 `npm run build` sin avisos y comparar el tamaño del CSS con el actual.
- [ ] 5.2 Repaso completo: 9 vistas × (escritorio 1440 px, móvil 375 px).
- [ ] 5.3 Repaso con teclado: menú, un modal, guardar el diario.
- [ ] 5.4 Fusionar `rediseno` en `main` (esto despliega en AWS) y comprobar la web publicada.

---

## Orden recomendado

| Orden | Bloque | Por qué |
|---|---|---|
| 1 | Fase 0 | Sin esto, todo lo demás tiene riesgo de pérdida. |
| 2 | 1.1, 1.5, 1.9, 2.3 | Fallos rápidos y visibles. |
| 3 | 1.2, 1.3, 1.4, 1.8 | Coherencia de datos: es lo que más resta credibilidad en una defensa. |
| 4 | 1.6, 1.7, 1.10, 2.1, 2.2 | Flujos y modales. |
| 5 | Fase 3 | Base técnica del rediseño. |
| 6 | Fase 4 | Rediseño. Va después de los tokens para no hacerlo dos veces. |
| 7 | 2.4, 2.5, 2.6, Fase 5 | Pulido y despliegue. |

## Qué mantener tal cual

- Menú lateral navy con lima y el logotipo.
- Estados con símbolo además de color (✓ ½ ✕).
- Glosario con el icono ⓘ.
- Mínimo tipográfico de 12 px, `:focus-visible` y `prefers-reduced-motion`.
- "Deshacer" tras eliminar una plantilla.
- La estructura del modal del diario (`JournalModal.jsx`): es el mejor resuelto.

## Qué se ha revisado y qué no

- **Revisado en el navegador:** Inicio (atleta, grupo y entrenador), Diario (atleta y grupo), Datos (tabla y gráficas), Perfil, Atletas, Preparaciones, Entrenamientos; modales de diario, editor de plantilla y revisión de solicitud; las 9 vistas a 375 px.
- **Revisado solo en el código:** Buscar entrenador y sus modales (no se puede llegar desde la interfaz), botones de `ActivityForm`.
- **Sin revisar:** detalle de sesión, resumen de fases, medias del diario, modales de nueva preparación y nueva semana, arrastrar y soltar, pestaña Calendario de Datos, contraste de color.
- **Sin pruebas automáticas:** el proyecto no tiene script de tests, así que todo se comprueba a mano.
