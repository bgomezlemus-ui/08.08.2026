# Anexo A — Matriz de análisis del corpus jurisprudencial

Soporte empírico del capítulo 2. Todos los datos de este anexo se regeneran con
`python3 herramientas/analisis_corpus.py --markdown --segmentar-2025`.

---

## A.1 Composición del corpus

Catorce resoluciones del TEPJF entre 1997 y 2025, seleccionadas por dos criterios
concurrentes: que consten en el repositorio de fuentes y que resuelvan sobre valoración
de prueba imperfecta o indiciaria en materia electoral.

### Advertencia sobre dos archivos mal identificados

| Archivo en el repositorio | Contenido real | Verificación |
|---|---|---|
| `SUP_AES_67_2006_TEPJF.pdf` | **SUP-JRC-356/2007**. Coalición «Movimiento Ciudadano» contra la Sala Electoral del TSJ de Veracruz, 19-XII-2007. Ponente: María del Carmen Alanis Figueroa | Encabezado del documento; coincide con el precedente citado en la Jurisprudencia 19/2008 |
| `SUP_JRC_086_2000_TEPJF.pdf` | **SUP-JRC-086/2002**. PAN contra el Pleno del TEPJ de Quintana Roo, 8-IV-2002. Ponente: José Luis de la Peza | Encabezado del documento; coincide con el precedente citado en la Jurisprudencia 39/2002 |

Ambas resoluciones son útiles y se conservan en el corpus, pero **deben citarse con su
identificador real**. El nombre del archivo no es fuente de identificación.

---

## A.2 Indicador I7 — Densidad léxica de valoración relacional

Conteo sobre el texto íntegro, normalizado (minúsculas, sin diacríticos, reconstruyendo
palabras cortadas por salto de línea). La densidad se expresa en marcadores por cada
10 000 palabras, de modo que la extensión de la resolución no distorsione la comparación.

Familias de marcadores:

- **Adminiculación**: `adminicul*`, `concatena*`, `robustec*`
- **Indiciario**: `indicio*`, `indiciari*`, `presunción humana`
- **Art. 16**: `sana crítica`, `recto raciocinio`, `verdad conocida`, `máxima(s) de experiencia`
- **Enlace**: solo cuando acompaña a un vocablo inferencial (`enlace directo`, `enlace lógico`,
  `enlace entre los hechos`). El filtro es necesario porque en las resoluciones recientes
  «enlace» aparece de forma masiva como sinónimo de URL.

| Resolución | Año | Palabras | Adminic. | Indicios | Art. 16 | Enlace | Total | Dens./10k |
|---|---|---|---|---|---|---|---|---|
| SUP-JRC-061/97 | 1997 | 34,070 | 4 | 0 | 0 | 0 | 4 | 1.17 |
| SUP-JRC-052/98 | 1998 | 31,286 | 16 | 0 | 6 | 0 | 22 | 7.03 |
| SUP-JRC-349/2001 | 2001 | 178,724 | 23 | 29 | 9 | 0 | 61 | 3.41 |
| SUP-JRC-024/2002 | 2002 | 16,030 | 11 | 21 | 11 | 0 | 43 | **26.82** |
| SUP-JRC-086/2002 | 2002 | 38,784 | 0 | 11 | 7 | 1 | 19 | 4.90 |
| SUP-JDC-1180/2002 | 2003 | 21,063 | 1 | 0 | 1 | 0 | 2 | 0.95 |
| SUP-JRC-488/2003 | 2003 | 31,437 | 9 | 6 | 4 | 1 | 20 | 6.36 |
| SUP-JRC-356/2007 | 2007 | 105,056 | 43 | 41 | 12 | 0 | 96 | 9.14 |
| SUP-JRC-083/2008 | 2008 | 31,490 | 18 | 44 | 7 | 0 | 69 | **21.91** |
| SUP-JDC-488/2008 | 2008 | 11,779 | 0 | 8 | 3 | 0 | 11 | 9.34 |
| SUP-JRC-166/2021 | 2021 | 82,608 | 15 | 80 | 6 | 0 | 101 | 12.23 |
| SUP-JRC-101/2022 | 2022 | 106,472 | 19 | 54 | 0 | 1 | 74 | 6.95 |
| SX-JDC-470/2024 | 2024 | 13,837 | 16 | 22 | 0 | 0 | 38 | **27.46** |
| **SUP-JIN-818/2025** | **2025** | **5,703** | **0** | **1** | **0** | **0** | **1** | **1.75** |

### Lectura del indicador

El dato no debe sobreinterpretarse. La densidad léxica **no mide calidad argumentativa**:
mide presencia de vocabulario. Tres precisiones obligadas:

1. **No hay declive progresivo.** La serie no desciende: oscila. Los picos están en 2002
   (26.82), 2008 (21.91) y 2024 (27.46) — el último, inmediatamente anterior al caso de
   referencia. La hipótesis de una erosión gradual del criterio **no se sostiene** con estos
   datos y debe descartarse expresamente en el capítulo 2.
2. **Lo que hay es una discontinuidad.** SX-JDC-470/2024, la resolución más densa de toda la
   serie, precede en doce meses a la menos densa. Una Sala Regional revoca por falta de
   valoración adminiculada; catorce meses después la Sala Superior resuelve sin usar una sola
   vez el vocabulario de la adminiculación.
3. **La extensión importa.** SUP-JIN-818/2025 tiene 5 703 palabras, la resolución más breve
   del corpus. La brevedad es parte del fenómeno, no un artefacto de medición: un tribunal
   que no valora no necesita extenderse.

---

## A.3 Análisis segmentado del caso de referencia

SUP-JIN-818/2025 partido en dos: sentencia de la mayoría y votos particulares de Otálora
Malassis y Rodríguez Mondragón.

| Término | Sentencia (mayoría) | Votos particulares |
|---|---|---|
| `indicio` | 1 | 0 |
| `adminicul*` | 0 | 0 |
| `valorar` | **0** | **0** |
| `valoración` | **0** | **0** |
| `inoperan*` | 4 | 5 |
| `genéric*` | 4 | 2 |
| `subjetiv*` | 2 | 1 |
| `prueba` | 5 | 4 |

Extensión: mayoría, 3 430 palabras; votos particulares, 2 273.

### El dato central

**Las palabras «valorar» y «valoración» no aparecen ni una sola vez en todo el documento**,
ni en la mayoría ni en el disenso. En una resolución que decide sobre la validez de una
elección a partir de material probatorio aportado por el actor, el verbo que nombra la
operación exigida por el artículo 16 de la LGSMIME está ausente.

### El pasaje decisivo

La única ocurrencia de `indicio` pertenece a la mayoría, no al disenso, y concentra el
problema entero de la tesis:

> «Esos elementos **solo constituyen un indicio**, sin que se aporten otros elementos de
> prueba para acreditar cómo tales hechos, **de suponer su existencia**, impactan en la
> elección en la que participó.»

Cuatro operaciones defectuosas en una sola frase:

| # | Defecto | Operador del art. 16.3 omitido |
|---|---|---|
| 1 | Funde dos pruebas distintas —capturas de pantalla y un acordeón impreso— en «un indicio» singular | *el recto raciocinio de la relación que guardan entre sí* |
| 2 | Afirma que no se aportaron otros elementos, pese a la nota periodística sobre entrega de acordeones afuera de una casilla del mismo distrito judicial | *los demás elementos que obren en el expediente* |
| 3 | Ignora que el acuerdo INE/CG535/2025, confirmado en SUP-REP-179/2025, ya había tenido por existente la estrategia de acordeones | *la verdad conocida* |
| 4 | Se niega a fijar el hecho base: «de suponer su existencia» | *las afirmaciones de las partes* |

De ahí deriva la inoperancia. **La atomización no es un defecto paralelo a la clausura
argumentativa: es su fundamento expreso.** Este hallazgo resuelve el encuadre de la
hipótesis central y debe conducir el capítulo 2.

El voto particular de Rodríguez Mondragón lo formula en los mismos términos: «no comparto la
metodología de estudio […] no se les debió descalificar mediante una inoperancia superficial
que ignoró lo señalado y aportado en la demanda». El de Otálora Malassis añade el dato de la
verdad conocida: la existencia de los acordeones «jurídicamente se reconoció[,] por lo que no
son inferencias de la parte actora».

---

## A.4 Indicadores I1 a I6 — Sondeo léxico preliminar

Conteo de expresiones asociadas a cada indicador. **Es un sondeo, no una codificación.**
Sirve para orientar la lectura manual, no para sustituirla.

| Año | Resolución | I1 inventario | I3 máxima exp. | I5 hipótesis rivales | I6 umbral |
|---|---|---|---|---|---|
| 1997 | SUP-JRC-061/97 | 1 | 0 | 10 | 5 |
| 1998 | SUP-JRC-052/98 | 0 | 0 | 16 | 15 |
| 2001 | SUP-JRC-349/2001 | 1 | 3 | 10 | 48 |
| 2002 | SUP-JRC-024/2002 | 0 | 1 | 1 | 10 |
| 2002 | SUP-JRC-086/2002 | 3 | 1 | 8 | 8 |
| 2003 | SUP-JDC-1180/2002 | 0 | 0 | 1 | 2 |
| 2003 | SUP-JRC-488/2003 | 1 | 0 | 5 | 4 |
| 2007 | SUP-JRC-356/2007 | 7 | 3 | 27 | 21 |
| 2008 | SUP-JRC-083/2008 | 1 | 2 | 3 | 11 |
| 2008 | SUP-JDC-488/2008 | 5 | 1 | 0 | 1 |
| 2021 | SUP-JRC-166/2021 | 10 | 4 | 14 | 15 |
| 2022 | SUP-JRC-101/2022 | 6 | 0 | 23 | 7 |
| 2024 | SX-JDC-470/2024 | 1 | 0 | 2 | 0 |
| **2025** | **SUP-JIN-818/2025** | **0** | **0** | **0** | **0** |

### Falsos positivos conocidos

- **I5** está contaminado por «hipótesis normativa» y «hipótesis legal», que designan el
  supuesto de hecho de la norma y no una hipótesis fáctica rival. Los recuentos de 1997, 1998
  y 2022 requieren depuración manual antes de usarse.
- **I6** cuenta «prueba plena» y «plenamente acreditadas», que son **fórmulas de resultado, no
  enunciaciones de umbral**. Su abundancia es, en realidad, evidencia a favor de la tesis: el
  tribunal declara el resultado sin haber declarado antes la medida. El indicador se
  reinterpreta en ese sentido en el capítulo 4, §4.1.
- **I3** en cero no implica ausencia de máxima de experiencia: implica que no se la nombra.
  La máxima puede operar tácitamente, que es justamente el defecto que el paso P3 del
  protocolo corrige.

### El único resultado limpio

SUP-JIN-818/2025 marca **cero en los seis indicadores y en las cuatro familias léxicas**. No
hay falso positivo posible en un conjunto vacío. Es la observación más robusta del análisis y
no depende de ninguna decisión de codificación.

---

## A.5 Codificación manual pendiente

El sondeo anterior no sustituye la lectura. Antes de cerrar el capítulo 2 debe completarse la
codificación cualitativa de I1 a I6 sobre las catorce resoluciones, en tres valores
—presente, parcial, ausente— con transcripción del pasaje que justifica cada asignación. Sin
ese respaldo textual, la matriz no es publicable.

Estado a la fecha:

| Resolución | Lectura íntegra | Codificación I1-I6 |
|---|---|---|
| SUP-JIN-818/2025 | completa | completa |
| SX-JDC-470/2024 | parcial | pendiente |
| SUP-JRC-349/2001, 024/2002, 052/98, 061/97, 166/2021 | pasajes clave | pendiente |
| Resto del corpus | sondeo léxico | pendiente |
