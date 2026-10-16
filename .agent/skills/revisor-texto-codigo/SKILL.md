---
name: revisor-texto-codigo
description: Revisa ortografia, gramatica, inconsistencias y expresion en fragmentos de texto o codigo (como LaTeX, Markdown o documentacion) aplicando cambios minimos. Usar cuando el usuario comparta texto o codigo con texto incrustado y pida corregir faltas de ortografia, mejorar la expresion o detectar incoherencias alterando lo menos posible el original.
---
# Revisor de Texto y Codigo

Analiza fragmentos de texto o bloques de codigo con contenido textual para identificar errores ortograficos, gramaticales, de puntuacion e inconsistencias de expresion, entregando un desglose claro de las correcciones y el bloque final corregido con la minima intervencion posible.

## When to Use

- El usuario pide revisar la ortografia, gramatica o expresion de un texto o documento tecnico.
- El usuario comparte bloques de codigo (LaTeX, Markdown, HTML, JSON, comentarios) y solicita pulir el texto sin alterar la estructura ni reescribir el estilo por completo.
- El usuario busca detectar inconsistencias terminologicas, repeticiones o tiempos verbales mezclados en requisitos, historias de usuario o documentacion.

## Steps

1. **Analizar el contenido sin alterar el codigo base**: Separa mentalmente la sintaxis del lenguaje o marcado (comandos, etiquetas, llaves, indentacion) del contenido textual en lenguaje natural para no romper la compilacion ni el formato original.
2. **Detectar errores e inconsistencias**: Examina el texto buscando los siguientes problemas ordenados por prioridad:

   - **Ortografia y acentuacion**: Tildes faltantes (especialmente en adverbios terminados en -mente, pronombres interrogativos indirectos y tildes diacriticas), errores tipograficos y palabras inexistentes o mal empleadas.
   - **Gramatica y preposiciones**: Contracciones obligatorias (como "del" y "al"), uso correcto de perifrasis verbales (como "deber + infinitivo" para obligacion frente a "deber de + infinitivo" para probabilidad) y regimen preposicional adecuado.
   - **Coherencia e inconsistencias**: Repeticion excesiva de la misma palabra en una misma frase, cambios injustificados de tiempos verbales entre elementos paralelos y uso de terminos distintos para referirse al mismo concepto.
   - **Expresion y puntuacion**: Oraciones excesivamente largas unidas solo por comas (reemplazar por punto y seguido cuando corresponda) y giros coloquiales si el contexto requiere un registro formal o academico.

3. **Presentar el diagnostico agrupado**: Expone los hallazgos de forma estructurada (por seccion, bloque o categoria). Para cada fallo detectado:

   - Cita el fragmento original exacto y muestra el reemplazo propuesto.
   - Explica brevemente el motivo gramatical, ortografico o de estilo para que el usuario comprenda el cambio.
   - Si una mejora de estilo es opcional, marcala explicitamente como opcional.

4. **Generar el codigo o texto corregido**: Entrega al final un bloque listo para copiar y pegar con todas las correcciones aplicadas, respetando estrictamente el principio de intervencion minima.

## Gotchas

- **Sobrecorreccion de estilo**: No reescribas frases completas si basta con cambiar una palabra, una preposicion o un signo de puntuacion. El objetivo es conservar la voz del autor corrigiendo solo lo incorrecto o incoherente.
- **Alteracion accidental de sintaxis**: Nunca modifiques nombres de variables, comandos de formato, etiquetas ni parametros tecnicos al aplicar correcciones ortograficas.
- **Falsos amigos terminologicos**: Verifica que los terminos tecnicos traducidos correspondan al estandar real en espanol (por ejemplo, usar "portapapeles" en lugar de "cortapapeles").
