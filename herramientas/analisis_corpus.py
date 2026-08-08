#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Análisis de contenido del corpus jurisprudencial de la tesis.

Mide la densidad del vocabulario de valoración probatoria relacional en las
sentencias del TEPJF que integran el corpus (1997-2025), a fin de dar soporte
empírico reproducible al capítulo 2.

Uso:
    pip install pypdf
    python3 herramientas/analisis_corpus.py                 # tabla en consola
    python3 herramientas/analisis_corpus.py --markdown      # tabla en Markdown
    python3 herramientas/analisis_corpus.py --cache tmp/    # conserva los .txt

Dependencia única: pypdf. En entornos donde `cryptography` esté rota, ejecutar
antes `pip install --upgrade cffi`.
"""

from __future__ import annotations

import argparse
import os
import re
import sys
import unicodedata
from dataclasses import dataclass, field

# --------------------------------------------------------------------------
# Corpus: identificador real de la resolución -> archivo PDF del repositorio.
#
# ADVERTENCIA METODOLÓGICA (cautela núm. 2 del plan): el archivo
# "SUP_AES_67_2006_TEPJF.pdf" NO contiene SUP-AES-67/2006. Su encabezado
# corresponde a SUP-JRC-356/2007 (Coalición "Movimiento Ciudadano" contra la
# Sala Electoral del TSJ de Veracruz, 19 de diciembre de 2007), uno de los
# precedentes de la Jurisprudencia 19/2008. Se cita con su identificador real.
#
# Igual observación para "SUP_JRC_086_2000_TEPJF.pdf", cuyo texto corresponde a
# SUP-JRC-086/2002 (8 de abril de 2002), precedente de la Jurisprudencia 39/2002.
# --------------------------------------------------------------------------
CORPUS: list[tuple[str, int, str]] = [
    # (identificador real, año de la resolución, archivo)
    ("SUP-JRC-061/97",   1997, "SUP_JRC_61_1997_TEPJF.pdf"),
    ("SUP-JRC-052/98",   1998, "SUP_JRC_52_1998_TEPJF.pdf"),
    ("SUP-JRC-349/2001", 2001, "SUP_JRC_349_2001_TEPJF.pdf"),
    ("SUP-JRC-024/2002", 2002, "SUP_JRC_024_2002_TEPJF.pdf"),
    ("SUP-JRC-086/2002", 2002, "SUP_JRC_086_2000_TEPJF.pdf"),
    ("SUP-JDC-1180/2002", 2003, "SUP_JDC_1180_2002_TEPJF.pdf"),
    ("SUP-JRC-488/2003", 2003, "SUP_JRC_488_2003_TEPJF.pdf"),
    ("SUP-JRC-356/2007", 2007, "SUP_AES_67_2006_TEPJF.pdf"),
    ("SUP-JRC-083/2008", 2008, "SUP_JRC_83_2008_TEPJF.pdf"),
    ("SUP-JDC-488/2008", 2008, "SUP_JDC_488_2008_TEPJF.pdf"),
    ("SUP-JRC-166/2021", 2021, "SUP_JRC_166_2021_TEPJF.pdf"),
    ("SUP-JRC-101/2022", 2022, "SUP_JRC_0101_2022_TEPJF.pdf"),
    ("SX-JDC-470/2024",  2024, "SX_JDC_0470_2024_TEPJF.pdf"),
    ("SUP-JIN-818/2025", 2025, "SUP_JIN_0818_2025_TEPJF.pdf"),
]

# --------------------------------------------------------------------------
# Marcadores léxicos de valoración relacional.
#
# Se agrupan en tres familias. Los patrones se aplican sobre texto normalizado
# (sin acentos, minúsculas, espacios colapsados) porque la extracción de PDF
# introduce guiones de corte y saltos de línea dentro de las palabras.
# --------------------------------------------------------------------------
MARCADORES: dict[str, list[str]] = {
    # Familia A: operación de relacionar unas pruebas con otras.
    "adminiculacion": [r"adminicul\w*", r"concatena\w*", r"robustec\w*"],
    # Familia B: razonamiento por indicios.
    "indiciario": [r"indicio\w*", r"indiciari\w*", r"presunci\w*\s+humana\w*"],
    # Familia C: fórmulas del artículo 16 de la LGSMIME.
    "art16": [
        r"sana\s+critica",
        r"recto\s+raciocinio",
        r"verdad\s+conocida",
        r"maxima\w*\s+de\s+(la\s+)?experiencia",
    ],
}

# "enlace" se cuenta aparte y con filtro: en las sentencias recientes aparece
# masivamente como sinónimo de URL ("no se localizó el enlace"), no como
# categoría probatoria. Solo se computa cuando acompaña a un vocablo inferencial.
ENLACE_PROBATORIO = re.compile(
    r"enlace\s+(directo|logico|causal|natural|racional|entre\s+los\s+(hechos|indicios))"
)


def normalizar(texto: str) -> str:
    """Minúsculas, sin diacríticos, sin guiones de corte, espacios colapsados."""
    texto = texto.replace("­", "")              # guion suave
    texto = re.sub(r"-\s*\n\s*", "", texto)          # palabra cortada por salto
    texto = unicodedata.normalize("NFKD", texto)
    texto = "".join(c for c in texto if not unicodedata.combining(c))
    return re.sub(r"\s+", " ", texto).lower()


@dataclass
class Resultado:
    clave: str
    anio: int
    archivo: str
    palabras: int = 0
    conteos: dict[str, int] = field(default_factory=dict)
    enlace: int = 0
    error: str = ""

    @property
    def total(self) -> int:
        return sum(self.conteos.values()) + self.enlace

    @property
    def densidad(self) -> float:
        """Marcadores por cada 10 000 palabras. Normaliza por extensión."""
        if not self.palabras:
            return 0.0
        return round(self.total * 10_000 / self.palabras, 2)


def extraer(ruta: str) -> str:
    from pypdf import PdfReader

    reader = PdfReader(ruta)
    partes = []
    for pagina in reader.pages:
        try:
            partes.append(pagina.extract_text() or "")
        except Exception:                             # página ilegible: se omite
            partes.append("")
    return "\n".join(partes)


def analizar(base: str, cache: str | None = None) -> list[Resultado]:
    resultados: list[Resultado] = []
    for clave, anio, archivo in CORPUS:
        r = Resultado(clave=clave, anio=anio, archivo=archivo)
        ruta = os.path.join(base, archivo)
        if not os.path.exists(ruta):
            r.error = "archivo no encontrado"
            resultados.append(r)
            continue
        try:
            crudo = extraer(ruta)
        except Exception as exc:
            r.error = f"extracción fallida: {exc}"
            resultados.append(r)
            continue

        if cache:
            os.makedirs(cache, exist_ok=True)
            with open(os.path.join(cache, archivo[:-4] + ".txt"), "w") as fh:
                fh.write(crudo)

        texto = normalizar(crudo)
        r.palabras = len(texto.split())
        for familia, patrones in MARCADORES.items():
            r.conteos[familia] = sum(
                len(re.findall(p, texto)) for p in patrones
            )
        r.enlace = len(ENLACE_PROBATORIO.findall(texto))
        resultados.append(r)
    return resultados


def imprimir(resultados: list[Resultado], markdown: bool) -> None:
    cols = ["Resolución", "Año", "Palabras", "Adminic.", "Indicios",
            "Art. 16", "Enlace", "Total", "Dens./10k"]
    filas = []
    for r in resultados:
        if r.error:
            filas.append([r.clave, str(r.anio), r.error, "", "", "", "", "", ""])
            continue
        filas.append([
            r.clave, str(r.anio), f"{r.palabras:,}",
            str(r.conteos.get("adminiculacion", 0)),
            str(r.conteos.get("indiciario", 0)),
            str(r.conteos.get("art16", 0)),
            str(r.enlace), str(r.total), f"{r.densidad:.2f}",
        ])

    if markdown:
        print("| " + " | ".join(cols) + " |")
        print("|" + "|".join(["---"] * len(cols)) + "|")
        for f in filas:
            print("| " + " | ".join(f) + " |")
        return

    anchos = [max(len(cols[i]), *(len(f[i]) for f in filas))
              for i in range(len(cols))]
    linea = "  ".join(c.ljust(anchos[i]) for i, c in enumerate(cols))
    print(linea)
    print("-" * len(linea))
    for f in filas:
        print("  ".join(f[i].ljust(anchos[i]) for i in range(len(cols))))


# --------------------------------------------------------------------------
# Análisis segmentado del caso de referencia.
#
# SUP-JIN-818/2025 se examina partiendo el documento en dos: la sentencia de la
# mayoría y los dos votos particulares. La partición permite verificar en qué
# segmento sobrevive el vocabulario probatorio.
# --------------------------------------------------------------------------
CORTE_VOTOS = "VOTO PARTICULAR PARCIAL QUE FORMULA"

SEGMENTADOS = ["indicio", "adminicul", "valorar", "valoracion",
               "inoperan", "generic", "subjetiv", "prueba"]


def segmentar_2025(base: str) -> None:
    ruta = os.path.join(base, "SUP_JIN_0818_2025_TEPJF.pdf")
    if not os.path.exists(ruta):
        print("SUP-JIN-818/2025 no disponible.", file=sys.stderr)
        return
    crudo = extraer(ruta)
    corte = crudo.find(CORTE_VOTOS)
    if corte < 0:
        print("No se localizó el inicio de los votos particulares.",
              file=sys.stderr)
        return

    piezas = {
        "Sentencia (mayoría)": normalizar(crudo[:corte]),
        "Votos particulares": normalizar(crudo[corte:]),
    }
    print("\nSUP-JIN-818/2025 — análisis segmentado\n")
    encabezado = ["Término"] + list(piezas)
    print("| " + " | ".join(encabezado) + " |")
    print("|" + "|".join(["---"] * len(encabezado)) + "|")
    for termino in SEGMENTADOS:
        fila = [termino] + [
            str(len(re.findall(termino, texto))) for texto in piezas.values()
        ]
        print("| " + " | ".join(fila) + " |")
    for nombre, texto in piezas.items():
        print(f"\n{nombre}: {len(texto.split()):,} palabras")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--base",
        default=os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        help="directorio raíz del repositorio con los PDF",
    )
    parser.add_argument("--markdown", action="store_true",
                        help="salida en tabla Markdown")
    parser.add_argument("--cache", default=None,
                        help="directorio donde conservar el texto extraído")
    parser.add_argument("--segmentar-2025", action="store_true",
                        help="desglosa SUP-JIN-818/2025 en mayoría y votos")
    args = parser.parse_args()

    resultados = analizar(args.base, args.cache)
    imprimir(resultados, args.markdown)

    if args.segmentar_2025:
        segmentar_2025(args.base)

    fallidos = [r.clave for r in resultados if r.error]
    if fallidos:
        print(f"\nAdvertencia: sin procesar -> {', '.join(fallidos)}",
              file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
