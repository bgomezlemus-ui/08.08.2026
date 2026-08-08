# 08.08.2026

Tesis de Maestría — **El déficit de estándares de valoración probatoria en la justicia
electoral mexicana: protocolo de adminiculación indiciaria y umbral de suficiencia
verificables**

## Estructura

| Ruta | Contenido |
|---|---|
| `*.pdf` (raíz) | Fuentes. 49 documentos: doctrina, normativa, jurisprudencia y casos interamericanos |
| `tesis/00-plan-de-investigacion.md` | Protocolo de investigación: problema, hipótesis, objetivos, método, cautelas y cronograma |
| `tesis/01-` a `tesis/05-` | Esqueletos capitulares, con la fuente asignada a cada apartado |
| `tesis/redaccion/` | Texto redactado, sección por sección. Fuente del documento Word |
| `herramientas/construir_tesis.js` | Renderiza `tesis/redaccion/` a Word con los criterios editoriales de la UMSNH |
| `docs/Gómez,B-2026.08.08-Tesis.docx` | Documento de tesis en construcción |
| `tesis/anexos/matriz-corpus.md` | Anexo A. Análisis de contenido de las catorce resoluciones |
| `tesis/anexos/fichas-fuentes.md` | Anexo B. Ficha por fuente: qué aporta y dónde se usa |
| `herramientas/analisis_corpus.py` | Genera las tablas del anexo A |
| `docs/Plan_de_tesis.docx` | Protocolo de investigación en Word, formato APA 7 |

## Reconstruir el documento de tesis

```bash
npm install docx
node herramientas/construir_tesis.js
```

El documento se regenera completo en cada ejecución. Para agregar una sección nueva basta con
redactarla en `tesis/redaccion/` y añadir el archivo a la lista `SECCIONES` del constructor.

Formato aplicado: Arial 12, interlineado 1.5, tamaño carta, márgenes superior e inferior de
2.5 cm e izquierdo y derecho de 3 cm, sangría de primera línea de 1.25 cm, espaciamiento cero
entre párrafos, numeración romana en preliminares y arábiga desde el capítulo 1. Citas en
APA 7 con autor, año y página.

## Reproducir el análisis del corpus

```bash
pip install pypdf
python3 herramientas/analisis_corpus.py --markdown --segmentar-2025
```

## Advertencias sobre las fuentes

Detalle completo en `tesis/00-plan-de-investigacion.md`, §9.

- **La ley de medios de impugnación** del repositorio es la del DOF 02-03-2023, invalidada.
  Los artículos 14, 15 y 16 coinciden con el texto aplicable; **la numeración de nulidades
  no**.
- **Dos archivos están mal identificados.** `SUP_AES_67_2006_TEPJF.pdf` contiene
  SUP-JRC-356/2007; `SUP_JRC_086_2000_TEPJF.pdf` contiene SUP-JRC-086/2002.
- **Varios PDF antiguos** tienen capas de texto que omiten espacios. Las citas textuales deben
  transcribirse leyendo el documento, no copiarse del texto extraído.
