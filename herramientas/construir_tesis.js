/**
 * Constructor del documento de tesis.
 *
 * Lee los archivos de tesis/redaccion/ y los renderiza a .docx aplicando los
 * criterios editoriales de la División de Estudios de Posgrado (UMSNH).
 *
 * Uso:  node herramientas/construir_tesis.js
 *
 * Para agregar una sección nueva basta con añadir su archivo .md a la lista
 * SECCIONES. El documento se reconstruye completo en cada ejecución.
 *
 * Convenciones del .md de entrada:
 *   ## SUMARIO (capítulo N)   -> bloque de sumario en versalitas
 *   ## 1.1. Título            -> encabezado de nivel 1
 *   ### 1.1.1. Título         -> encabezado de nivel 2
 *   #### 1.1.1.1. Título      -> encabezado de nivel 3
 *   > texto                   -> transcripción (>40 palabras): 11 pt, sin comillas
 *   *texto*                   -> cursivas
 *   ---, # …, bloques «> Fuente de verdad…» -> ignorados
 */

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, PageOrientation,
  Footer, PageNumber, NumberFormat, PageBreak, HeadingLevel,
  TabStopType, LeaderType,
} = require('docx');

// ---------------------------------------------------------------- constantes
const RAIZ = path.dirname(__dirname);
const CM = 567;                       // 1 cm en DXA
const CARTA = { width: 12240, height: 15840 };
const MARGEN = { top: 2.5 * CM, bottom: 2.5 * CM, left: 3 * CM, right: 3 * CM };

const FUENTE = 'Arial';
const NEGRO = '000000';               // los estilos Heading de Word aplican azul por defecto
const CUERPO = 24;                    // 12 pt (half-points)
const MENOR = 22;                     // 11 pt
const INTERLINEADO = 360;             // 1.5 líneas
const SANGRIA = 1.25 * CM;
const ANCHO_UTIL = CARTA.width - MARGEN.left - MARGEN.right;

// Índice generado en dos pasadas: compilar.sh renderiza, mide en qué página cae
// cada encabezado y escribe docs/.indice.json. Sin ese archivo los números salen
// en blanco, pero el número de renglones es el mismo, de modo que la paginación
// no cambia entre una pasada y otra.
const RUTA_INDICE = path.join(RAIZ, 'docs', '.indice.json');
const PAGINAS = fs.existsSync(RUTA_INDICE)
  ? JSON.parse(fs.readFileSync(RUTA_INDICE, 'utf8'))
  : {};

// Sangrías de encabezado por nivel, según la tabla de criterios editoriales.
const NIVEL = {
  1: { left: 0.5 * CM, hanging: 0.5 * CM,  blancoDespues: true },
  2: { left: 1.0 * CM, hanging: 0.75 * CM, blancoDespues: true },
  3: { left: 1.5 * CM, hanging: 1.0 * CM,  blancoDespues: true },
};

// Secciones ya redactadas, en orden. Ampliar conforme avance el trabajo.
const SECCIONES = [
  { archivo: 'tesis/redaccion/cap1-1.1.md', capitulo: 1 },
  { archivo: 'tesis/redaccion/cap1-1.2.md', capitulo: 1 },
  { archivo: 'tesis/redaccion/cap1-1.3.md', capitulo: 1 },
  { archivo: 'tesis/redaccion/cap1-1.4.md', capitulo: 1 },
  { archivo: 'tesis/redaccion/cap1-1.5.md', capitulo: 1 },
];

const TITULOS_CAPITULO = {
  1: 'Categorías de epistemología jurídica para la prueba por indicios',
};

// ------------------------------------------------------------------ utilidad
/** Convierte *cursivas* en runs; el resto queda en redonda. */
function runs(texto, { size = CUERPO, bold = false } = {}) {
  const partes = texto.split(/(\*[^*]+\*)/g).filter(Boolean);
  return partes.map(p => {
    const it = p.startsWith('*') && p.endsWith('*') && p.length > 2;
    return new TextRun({
      text: it ? p.slice(1, -1) : p,
      font: FUENTE, size, bold, italics: it, color: NEGRO,
    });
  });
}

const vacio = (size = CUERPO, keepNext = false) => new Paragraph({
  spacing: { line: INTERLINEADO, before: 0, after: 0 },
  keepNext,
  children: [new TextRun({ text: '', font: FUENTE, size, color: NEGRO })],
});

/** Párrafo de cuerpo. La primera línea lleva sangría salvo tras un título. */
function parrafo(texto, { sangria = true } = {}) {
  return new Paragraph({
    spacing: { line: INTERLINEADO, before: 0, after: 0 },
    alignment: AlignmentType.JUSTIFIED,
    indent: sangria ? { firstLine: SANGRIA } : undefined,
    children: runs(texto),
  });
}

/** Transcripción de más de 40 palabras: bloque a 11 pt, sin comillas. */
function transcripcion(texto) {
  return new Paragraph({
    spacing: { line: INTERLINEADO, before: 0, after: 0 },
    alignment: AlignmentType.JUSTIFIED,
    indent: { left: SANGRIA },
    children: runs(texto, { size: MENOR }),
  });
}

/** Encabezado: numeral en redonda, texto en cursivas, sin punto final. */
function encabezado(numeral, texto, nivel) {
  const cfg = NIVEL[nivel];
  return new Paragraph({
    heading: nivel === 1 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
    spacing: { line: INTERLINEADO, before: 0, after: 0 },
    alignment: AlignmentType.LEFT,
    indent: { left: cfg.left, hanging: cfg.hanging },
    keepNext: true,
    keepLines: true,
    children: [
      new TextRun({ text: numeral + ' ', font: FUENTE, size: CUERPO, color: NEGRO }),
      new TextRun({ text: texto, font: FUENTE, size: CUERPO, italics: true, color: NEGRO }),
    ],
  });
}

/** Portada del capítulo: cinco líneas en blanco, título en negritas centrado. */
function portadaCapitulo(numero, titulo, primero) {
  // La sección del cuerpo ya abre en página nueva: el salto solo hace falta
  // a partir del segundo capítulo.
  const out = primero ? [] : [new Paragraph({ children: [new PageBreak()] })];
  for (let i = 0; i < 5; i++) out.push(vacio());
  out.push(new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { line: INTERLINEADO, before: 0, after: 0 },
    alignment: AlignmentType.CENTER,
    keepNext: true,
    children: [new TextRun({ text: `Capítulo ${numero}`, font: FUENTE, size: CUERPO, bold: true, color: NEGRO })],
  }));
  out.push(new Paragraph({
    spacing: { line: INTERLINEADO, before: 0, after: 0 },
    alignment: AlignmentType.CENTER,
    keepNext: true,
    children: [new TextRun({ text: titulo, font: FUENTE, size: CUERPO, bold: true, color: NEGRO })],
  }));
  out.push(vacio(CUERPO, true));
  return out;
}

/** SUMARIO: vocablo en versalitas, numerales en redonda, títulos en cursivas. */
function sumario(texto) {
  const hijos = [new TextRun({
    text: 'Sumario: ', font: FUENTE, size: MENOR, smallCaps: true, color: NEGRO,
  })];
  // "1.1. Título. 1.2. Título." -> numeral redonda + título cursiva
  const re = /(\d+(?:\.\d+)+\.)\s*([^.]*(?:\.(?!\s*\d)[^.]*)*\.)\s*/g;
  let m;
  while ((m = re.exec(texto)) !== null) {
    hijos.push(new TextRun({ text: m[1] + ' ', font: FUENTE, size: MENOR, color: NEGRO }));
    hijos.push(new TextRun({ text: m[2].trim() + ' ', font: FUENTE, size: MENOR, italics: true, color: NEGRO }));
  }
  return new Paragraph({
    spacing: { line: INTERLINEADO, before: 0, after: 0 },
    alignment: AlignmentType.JUSTIFIED,
    indent: { left: 1 * CM, right: 1 * CM },
    children: hijos,
  });
}

// -------------------------------------------------------------------- parseo
function parsear(md) {
  const bloques = [];
  const lineas = md.split('\n');
  let buf = [], quote = [], enSumario = false, saltarPreambulo = true;

  const cierraParrafo = () => { if (buf.length) { bloques.push({ t: 'p', v: buf.join(' ') }); buf = []; } };
  const cierraQuote = () => { if (quote.length) { bloques.push({ t: 'q', v: quote.join(' ') }); quote = []; } };

  for (const linea of lineas) {
    const s = linea.trim();

    if (s.startsWith('## SUMARIO')) { cierraParrafo(); cierraQuote(); enSumario = true; saltarPreambulo = false; continue; }
    if (s === '---') { cierraParrafo(); cierraQuote(); if (enSumario) enSumario = false; continue; }
    if (s.startsWith('# ')) { cierraParrafo(); cierraQuote(); continue; }

    if (s.startsWith('>')) {
      // El preámbulo del archivo también usa "> "; se ignora hasta el sumario.
      cierraParrafo();
      if (saltarPreambulo) continue;
      quote.push(s.replace(/^>\s?/, ''));
      continue;
    }
    cierraQuote();

    const h = s.match(/^(#{2,4})\s+(\d+(?:\.\d+)+\.)\s+(.*)$/);
    if (h) {
      cierraParrafo(); enSumario = false; saltarPreambulo = false;
      bloques.push({ t: 'h', nivel: h[1].length - 1, num: h[2], v: h[3] });
      continue;
    }

    if (!s) {
      cierraParrafo();
      if (enSumario && buf.length === 0 && bloques.length && bloques[bloques.length - 1].t === 's') enSumario = false;
      continue;
    }

    if (enSumario) {
      // acumular todo el sumario en un solo bloque
      const ult = bloques[bloques.length - 1];
      if (ult && ult.t === 's') ult.v += ' ' + s;
      else bloques.push({ t: 's', v: s });
      continue;
    }

    if (saltarPreambulo) continue;
    buf.push(s);
  }
  cierraParrafo(); cierraQuote();
  return bloques;
}

// ----------------------------------------------------------------- ensamblado
const preliminares = [];
preliminares.push(new Paragraph({
  spacing: { before: 2400, line: INTERLINEADO }, alignment: AlignmentType.CENTER,
  children: [new TextRun({
    text: 'El déficit de estándares de valoración probatoria en la justicia electoral mexicana:',
    font: FUENTE, size: CUERPO, bold: true, color: NEGRO })],
}));
preliminares.push(new Paragraph({
  spacing: { line: INTERLINEADO }, alignment: AlignmentType.CENTER,
  children: [new TextRun({
    text: 'protocolo de adminiculación indiciaria y umbral de suficiencia verificables',
    font: FUENTE, size: CUERPO, bold: true, color: NEGRO })],
}));
for (let i = 0; i < 6; i++) preliminares.push(vacio());
preliminares.push(new Paragraph({
  spacing: { line: INTERLINEADO }, alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: 'Tesis de Maestría', font: FUENTE, size: CUERPO, color: NEGRO })],
}));
preliminares.push(new Paragraph({
  spacing: { line: INTERLINEADO }, alignment: AlignmentType.CENTER,
  children: [new TextRun({
    text: 'Universidad Michoacana de San Nicolás de Hidalgo', font: FUENTE, size: CUERPO })],
}));
preliminares.push(new Paragraph({
  spacing: { line: INTERLINEADO }, alignment: AlignmentType.CENTER,
  children: [new TextRun({
    text: 'Facultad de Derecho y Ciencias Sociales · División de Estudios de Posgrado',
    font: FUENTE, size: CUERPO })],
}));
preliminares.push(new Paragraph({ children: [new PageBreak()] }));
preliminares.push(new Paragraph({
  spacing: { line: INTERLINEADO }, alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: 'Índice', font: FUENTE, size: CUERPO, bold: true, color: NEGRO })],
}));
preliminares.push(vacio());

/** Renglón de índice: título a la izquierda, página a la derecha con puntos guía. */
function lineaIndice(texto, pagina, nivel) {
  return new Paragraph({
    spacing: { line: INTERLINEADO, before: 0, after: 0 },
    indent: { left: nivel * 0.5 * CM, right: 0 },
    tabStops: [{ type: TabStopType.RIGHT, position: ANCHO_UTIL, leader: LeaderType.DOT }],
    children: [
      new TextRun({ text: texto + '\t', font: FUENTE, size: MENOR, color: NEGRO }),
      new TextRun({ text: String(pagina ?? ''), font: FUENTE, size: MENOR, color: NEGRO }),
    ],
  });
}

// Cuerpo
const cuerpo = [];
const indiceEntradas = [];
let capActual = null;
let primerParrafoTrasTitulo = false;

for (const sec of SECCIONES) {
  const md = fs.readFileSync(path.join(RAIZ, sec.archivo), 'utf8');
  if (sec.capitulo !== capActual) {
    capActual = sec.capitulo;
    cuerpo.push(...portadaCapitulo(capActual, TITULOS_CAPITULO[capActual], cuerpo.length === 0));
    indiceEntradas.push({
      texto: `Capítulo ${capActual}. ${TITULOS_CAPITULO[capActual]}`,
      clave: `cap${capActual}`, nivel: 0,
    });
    primerParrafoTrasTitulo = true;
  }
  for (const b of parsear(md)) {
    if (b.t === 's') { cuerpo.push(sumario(b.v)); cuerpo.push(vacio(CUERPO, true)); primerParrafoTrasTitulo = true; continue; }
    if (b.t === 'h') {
      cuerpo.push(vacio());
      cuerpo.push(encabezado(b.num, b.v, b.nivel));
      indiceEntradas.push({ texto: `${b.num} ${b.v}`, clave: b.num, nivel: b.nivel });
      if (NIVEL[b.nivel].blancoDespues) cuerpo.push(vacio(CUERPO, true));
      primerParrafoTrasTitulo = true;
      continue;
    }
    if (b.t === 'q') { cuerpo.push(transcripcion(b.v)); primerParrafoTrasTitulo = false; continue; }
    cuerpo.push(parrafo(b.v, { sangria: !primerParrafoTrasTitulo }));
    primerParrafoTrasTitulo = false;
  }
}

// El índice se arma con los encabezados recogidos al construir el cuerpo.
for (const e of indiceEntradas) {
  preliminares.push(lineaIndice(e.texto, PAGINAS[e.clave], e.nivel));
}

const pie = (fmt) => new Footer({
  children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ children: [PageNumber.CURRENT], font: FUENTE, size: MENOR, color: NEGRO })],
  })],
});

const doc = new Document({
  styles: { default: { document: { run: { font: FUENTE, size: CUERPO, color: NEGRO } } } },
  sections: [
    {
      properties: {
        page: {
          size: { ...CARTA, orientation: PageOrientation.PORTRAIT },
          margin: MARGEN,
          pageNumbers: { start: 1, formatType: NumberFormat.LOWER_ROMAN },
        },
      },
      footers: { default: pie() },
      children: preliminares,
    },
    {
      properties: {
        page: {
          size: { ...CARTA, orientation: PageOrientation.PORTRAIT },
          margin: MARGEN,
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
        },
      },
      footers: { default: pie() },
      children: cuerpo,
    },
  ],
});

const salida = path.join(RAIZ, 'docs', 'Gómez,B-2026.08.08-Tesis.docx');
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(salida, buf);
  console.log('OK ->', path.relative(RAIZ, salida));
  console.log('Bloques en el cuerpo:', cuerpo.length);
});
